import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { issueCode } from "@/lib/verification";
import { sendMail, verificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 4 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists. Please sign in." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const issued = await issueCode(email, { pending: true, passwordHash, name });
  if (!issued.ok) {
    return NextResponse.json({ ok: false, error: issued.error }, { status: 429 });
  }

  await sendMail({ to: email, ...verificationEmail(issued.code) });
  return NextResponse.json({ ok: true, message: "Verification code sent to your email" });
}
