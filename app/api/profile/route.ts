import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { PROFILE_KEYS } from "@/lib/profile";
import { logClientActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  const data: Record<string, string> = {};
  for (const key of PROFILE_KEYS) {
    if (typeof body[key] === "string") data[key] = body[key].trim();
  }
  if (typeof body.name === "string") data.name = body.name.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.client.update({ where: { id: client.id }, data });
  await logClientActivity(
    client.id,
    "updated_profile",
    `Updated ${Object.keys(data).length} profile field(s)`
  );

  return NextResponse.json({ ok: true, client: { id: updated.id, name: updated.name ?? "" } });
}
