import { NextResponse } from "next/server";
import { issueCode } from "@/lib/verification";
import { sendMail, verificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const codeOnly = !!body.code_only;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
  }

  const issued = await issueCode(email, { codeOnly });
  if (!issued.ok) {
    return NextResponse.json({ ok: false, error: issued.error }, { status: 429 });
  }

  await sendMail({ to: email, ...verificationEmail(issued.code) });
  return NextResponse.json({ ok: true, message: "Code sent to your email" });
}
