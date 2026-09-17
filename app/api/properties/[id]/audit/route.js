import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { getAuditLog } from "../../../../../lib/audit";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const entries = await getAuditLog(params.id);
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
