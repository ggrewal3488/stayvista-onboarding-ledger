import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { query, rowToProperty } from "../../../../lib/db";
import { syncSheet } from "../../../../lib/sheetSync";
import { logAudit } from "../../../../lib/audit";
import { partForField, partSavedAtKey, isPartLocked } from "../../../../lib/access";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const res = await query("SELECT id, data, created_at, updated_at FROM properties WHERE id = $1", [params.id]);
    if (!res.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ property: rowToProperty(res.rows[0]) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const role = session.user?.role || "editor";
  const isAdmin = role === "admin";

  try {
    const patch = await req.json();
    const existing = await query("SELECT data FROM properties WHERE id = $1", [params.id]);
    if (!existing.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existingData = existing.rows[0].data;

    const patchKeys = Object.keys(patch);
    const isNoteOnly = patchKeys.length === 1 && patchKeys[0] === "agmNotes";

    // AGM notes are always addable, by anyone signed in — never lock-checked.
    if (!isNoteOnly && !isAdmin) {
      const touchedParts = new Set(patchKeys.map(partForField).filter(Boolean));
      for (const part of touchedParts) {
        if (isPartLocked(existingData, part)) {
          return NextResponse.json(
            { error: "This section was submitted more than 24 hours ago and is locked. Ask an admin to edit it.", code: "LOCKED" },
            { status: 403 }
          );
        }
      }
    }

    const merged = { ...existingData, ...patch };

    // Stamp each part's first-saved timestamp the first time any of its fields land, starting its 24h clock.
    const now = new Date().toISOString();
    for (const part of [1, 2, 3]) {
      const key = partSavedAtKey(part);
      if (!merged[key] && patchKeys.some((k) => partForField(k) === part)) {
        merged[key] = now;
      }
    }

    await query(
      "UPDATE properties SET data = $2::jsonb, updated_at = now() WHERE id = $1",
      [params.id, JSON.stringify(merged)]
    );
    await logAudit({
      propertyId: params.id,
      actorEmail: session.user?.email,
      actorRole: role,
      action: isNoteOnly ? "note_added" : "update",
      changes: patch,
    });
    await syncSheet();
    return NextResponse.json({ property: { id: params.id, ...merged } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    await query("DELETE FROM properties WHERE id = $1", [params.id]);
    await logAudit({
      propertyId: params.id,
      actorEmail: session.user?.email,
      actorRole: session.user?.role,
      action: "delete",
      changes: null,
    });
    await syncSheet();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
