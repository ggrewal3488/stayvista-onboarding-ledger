import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query, rowToProperty } from "../../../lib/db";
import { syncSheet } from "../../../lib/sheetSync";

export async function GET() {
  try {
    const res = await query("SELECT id, data, created_at, updated_at FROM properties ORDER BY created_at ASC");
    return NextResponse.json({ properties: res.rows.map(rowToProperty) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.propertyName || !String(body.propertyName).trim()) {
      return NextResponse.json({ error: "Property name is required." }, { status: 400 });
    }
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const data = { ...body, agmNotes: body.agmNotes || [], createdAt };
    await query("INSERT INTO properties (id, data) VALUES ($1, $2::jsonb)", [id, JSON.stringify(data)]);
    await syncSheet();
    return NextResponse.json({ property: { id, ...data } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
