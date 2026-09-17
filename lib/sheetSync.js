import { query, rowToProperty } from "./db";
import { exportPropertiesToSheet, sheetsConfigured } from "./sheets";

// Called after every create/update/delete so the Google Sheet always
// mirrors the database — no manual "Export" step for anyone to remember.
// Silently a no-op until GOOGLE_SERVICE_ACCOUNT_EMAIL / _PRIVATE_KEY /
// GOOGLE_SHEET_ID are set; failures are logged, never surfaced to the
// person saving a property (a save should never fail because the sheet
// sync had a hiccup).
export async function syncSheet() {
  if (!sheetsConfigured()) return;
  try {
    const res = await query(
      "SELECT id, data, created_at, updated_at FROM properties ORDER BY created_at ASC"
    );
    const properties = res.rows.map(rowToProperty);
    await exportPropertiesToSheet(properties);
  } catch (err) {
    console.error("Google Sheet auto-sync failed:", err.message);
  }
}
