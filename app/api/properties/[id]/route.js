import { NextResponse } from "next/server";
import { query, rowToProperty } from "../../../../lib/db";
import { syncSheet } from "../../../../lib/sheetSync";

export async function GET(req, { params }) {
  try {
    const res = await query("SELECT id, data, created_at, updated_at FROM properties WHERE id = $1", [params.id]);
    if (!res.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ property: rowToProperty(res.rows[0]) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const patch = await req.json();
    const existing = await query("SELECT data FROM properties WHERE id = $1", [params.id]);
    if (!existing.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const merged = { ...existing.rows[0].data, ...patch };
    await query(
      "UPDATE properties SET data = $2::jsonb, updated_at = now() WHERE id = $1",
      [params.id, JSON.stringify(merged)]
    );
    await syncSheet();
    return NextResponse.json({ property: { id: params.id, ...merged } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await query("DELETE FROM properties WHERE id = $1", [params.id]);
    await syncSheet();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
