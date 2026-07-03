import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLead } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export async function POST(req: Request) {
  const limited = rateLimit(req, "contact", 5, 10 * 60_000);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);

  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please fill in your name, a valid email, and a message." },
      { status: 400 }
    );
  }

  await prisma.contact.create({
    data: {
      id: `contact_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      received: nowStamp(),
      name,
      email,
      phone: str(body.phone) || null,
      company: str(body.company) || null,
      office: str(body.office) || null,
      message,
    },
  });

  await notifyLead("contact form message", {
    Name: name,
    Email: email,
    Phone: str(body.phone),
    Company: str(body.company),
    Office: str(body.office),
    Message: message,
  });

  return NextResponse.json({ ok: true });
}
