import { google } from "googleapis";
import { EXPORT_COLUMNS, overallStatus, preOnboardingComplete } from "./constants";

function agmNotesText(p) {
  return (p.agmNotes || [])
    .map((n) => {
      const d = new Date(n.date);
      const dstr = isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      return `${dstr}: ${n.text}`;
    })
    .join(" | ");
}

export function sheetsConfigured() {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
}

export async function exportPropertiesToSheet(properties) {
  if (!sheetsConfigured()) {
    const err = new Error("Google Sheets export isn't configured yet.");
    err.code = "NOT_CONFIGURED";
    throw err;
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = "Onboarding Tracker";

  // Make sure the tab exists.
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const hasTab = (meta.data.sheets || []).some((s) => s.properties.title === sheetName);
  if (!hasTab) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    });
  }

  const header = ["Property Name", ...EXPORT_COLUMNS.slice(1).map((c) => c[1]), "Overall Status", "Pre-Onboarding Complete", "AGM Notes"];
  const rows = [header];
  properties.forEach((p) => {
    const row = EXPORT_COLUMNS.map(([key]) => {
      const owner =
        key === "opsPreHandoverOwner" && p.opsPreHandoverOwner === "Others" ? p.opsPreHandoverOwnerOther :
        key === "staffingAuditAgent" && p.staffingAuditAgent === "Others" ? p.staffingAuditAgentOther :
        key === "inventoryReportAgent" && p.inventoryReportAgent === "Others" ? p.inventoryReportAgentOther :
        key === "technicalAuditAgent" && p.technicalAuditAgent === "Others" ? p.technicalAuditAgentOther :
        p[key];
      return owner == null ? "" : String(owner);
    });
    row.push(overallStatus(p), preOnboardingComplete(p), agmNotesText(p));
    rows.push(row);
  });

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
