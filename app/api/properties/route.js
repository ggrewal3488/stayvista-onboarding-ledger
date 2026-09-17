import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { query, rowToProperty } from "../../../lib/db";
import { syncSheet } from "../../../lib/sheetSync";
import { logAudit } from "../../../lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const res = await query("SELECT id, data, created_at, updated_at FROM properties ORDER BY created_at ASC");
    return NextResponse.json({ properties: res.rows.map(rowToProperty) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.propertyName || !String(body.propertyName).trim()) {
      return NextResponse.json({ error: "Property name is required." }, { status: 400 });
    }
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    // Submitting the new-property form counts as saving Part 1 — start its lock clock.
    const data = { ...body, agmNotes: body.agmNotes || [], createdAt, part1SavedAt: createdAt };
    await query("INSERT INTO properties (id, data) VALUES ($1, $2::jsonb)", [id, JSON.stringify(data)]);
    await logAudit({
      propertyId: id,
      actorEmail: session.user?.email,
      actorRole: session.user?.role,
      action: "create",
      changes: data,
    });
    await syncSheet();
    return NextResponse.json({ property: { id, ...data } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
