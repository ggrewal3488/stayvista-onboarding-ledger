// Fixed admin list, set once per the team's decision — edit this array and
// redeploy to change who can edit anytime (including after a part locks).
export const ADMIN_EMAILS = [
  "gursimran.grewal@stayvista.com",
  "rahul.anand@stayvista.com",
  "neeraj.pant@stayvista.com",
];

// Only Google accounts on these two domains may sign in.
export const ALLOWED_DOMAINS = ["stayvista.com", "stayvista.co.in"];

export const LOCK_HOURS = 24;

// Which stored fields belong to which of the three parts of the form.
// Used both to decide when a part first counts as "saved" (starting its
// 24-hour clock) and to check whether an incoming edit touches a locked part.
export const PART_FIELDS = {
  1: [
    "propertyName", "propertyType", "bedrooms", "location",
    "acquisitionAgent", "acquisitionDate", "agreementType", "agreementStatus",
  ],
  2: [
    "opsPreHandoverDate", "opsPreHandoverOwner", "opsPreHandoverOwnerOther",
    "teamDeploy", "teamDeployOps", "teamDeployTech", "teamDeployEventsFnb", "teamDeployReason",
    "staffingAuditStatus", "staffingAuditAgent", "staffingAuditAgentOther", "staffingAuditDetails",
    "inventoryReportStatus", "inventoryReportAgent", "inventoryReportAgentOther", "inventoryReportDetails",
    "technicalAuditStatus", "technicalAuditAgent", "technicalAuditAgentOther", "technicalAuditDetails",
    "accountManager", "assignedPM", "targetGoLiveDate", "goLiveStartDate",
  ],
  3: [
    "opsSimAuditStatus", "opsSimAuditDoneBy", "opsSimDetails",
    "postLaunchTrackersCreated", "postLaunchTrackersLink",
  ],
};

export const PART_LABELS = {
  1: "Part 1 — Acquisition",
  2: "Part 2 — Pre-onboarding",
  3: "Part 3 — Launch",
};

export function partForField(key) {
  for (const part of [1, 2, 3]) {
    if (PART_FIELDS[part].includes(key)) return part;
  }
  return null; // agmNotes and other unrestricted/system fields
}

export function isAdminEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_EMAILS.some((e) => e.toLowerCase() === lower);
}

export function isAllowedDomain(email) {
  const domain = (email || "").split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export function partSavedAtKey(part) {
  return `part${part}SavedAt`;
}

// True once LOCK_HOURS have passed since that part was first saved.
// A part with no saved-at timestamp yet (never touched) is never "locked".
export function isPartLocked(property, part) {
  const savedAt = property?.[partSavedAtKey(part)];
  if (!savedAt) return false;
  const hoursSince = (Date.now() - new Date(savedAt).getTime()) / 3600000;
  return hoursSince >= LOCK_HOURS;
}
