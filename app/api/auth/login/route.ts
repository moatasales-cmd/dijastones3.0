import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { issueCode } from "@/lib/verification";
import { sendMail, verificationEmail } from "@/lib/mail";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { email } });
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "No account found with this email. Please create an account." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, client.passwordHash ?? "");
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password. Please try again or request a code to sign in." },
      { status: 401 }
    );
  }

  // Unverified accounts must confirm their email first.
  if (!client.verified) {
    const issued = await issueCode(email);
    if (issued.ok) await sendMail({ to: email, ...verificationEmail(issued.code) });
    return NextResponse.json({
      ok: false,
      needs_verification: true,
      error: "Please verify your email. A code has been sent to your email.",
    });
  }

  await prisma.client.update({ where: { id: client.id }, data: { lastLogin: nowStamp() } });
  await logClientActivity(client.id, "signed_in");
  await createSession({ clientId: client.id, email: client.email, name: client.name ?? "" });

  return NextResponse.json({
    ok: true,
    client: { id: client.id, email: client.email, name: client.name ?? "" },
  });
}
