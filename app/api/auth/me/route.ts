import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";

export async function GET() {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, client: null });
  return NextResponse.json({
    ok: true,
    client: { id: client.id, email: client.email, name: client.name ?? "" },
  });
}
