import { NextResponse } from "next/server";
import { checkAdminCredentials, createAdminSession } from "@/lib/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  if (!checkAdminCredentials(username, password)) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
