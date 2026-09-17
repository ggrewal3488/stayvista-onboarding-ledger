import { query } from "./db";

let initialized = false;
async function ensureTable() {
  if (initialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      property_id TEXT NOT NULL,
      actor_email TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      changes JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  initialized = true;
}

// Best-effort: an audit-log hiccup should never block a save.
export async function logAudit({ propertyId, actorEmail, actorRole, action, changes }) {
  try {
    await ensureTable();
    await query(
      "INSERT INTO audit_log (property_id, actor_email, actor_role, action, changes) VALUES ($1, $2, $3, $4, $5::jsonb)",
      [propertyId, actorEmail || null, actorRole || null, action, JSON.stringify(changes || {})]
    );
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
}

export async function getAuditLog(propertyId) {
  await ensureTable();
  const res = await query(
    "SELECT id, actor_email, actor_role, action, changes, created_at FROM audit_log WHERE property_id = $1 ORDER BY created_at DESC LIMIT 200",
    [propertyId]
  );
  return res.rows;
}
