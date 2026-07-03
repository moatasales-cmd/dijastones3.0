import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowStamp } from "@/lib/time";
import { notifyLead } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email);
  const company = str(body.company);
  const role = str(body.role);
  const projectExample = str(body.projectExample);

  if (!name || !email || !company || !role || !projectExample) {
    return NextResponse.json(
      { ok: false, error: "Please complete the required fields." },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  const values = Array.isArray(body.values)
    ? body.values.filter((v: unknown): v is string => typeof v === "string")
    : [];

  await prisma.tradeApplication.create({
    data: {
      id: `trade_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      received: nowStamp(),
      name,
      email,
      phone: str(body.phone) || null,
      company,
      role,
      referral: str(body.referral) || null,
      values,
      projectExample,
      volume: str(body.volume) || null,
      stoneInterest: str(body.stoneInterest) || null,
      notes: str(body.notes) || null,
    },
  });

  await notifyLead("trade program application", {
    Name: name,
    Email: email,
    Phone: str(body.phone),
    Company: company,
    Role: role,
    Volume: str(body.volume),
    "Project example": projectExample,
  });

  return NextResponse.json({ ok: true, message: "Application received. We'll be in touch." });
}
