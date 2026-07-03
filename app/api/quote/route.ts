import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowStamp } from "@/lib/time";
import { notifyLead } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(req, "quote", 5, 10 * 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const stoneName = str(body.stoneName);

  if (!name || !email || !phone || !stoneName) {
    return NextResponse.json(
      { ok: false, error: "Please fill in your name, email, phone, and stone." },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  await prisma.quoteRequest.create({
    data: {
      id: `qreq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      received: nowStamp(),
      name,
      email,
      phone,
      phoneCountry: str(body.phoneCountry) || null,
      stoneId: str(body.stoneId) || null,
      stoneName,
      area: str(body.area) || null,
      areaUnit: str(body.areaUnit) || "m²",
      message: str(body.message) || null,
    },
  });

  await notifyLead("quote request", {
    Name: name,
    Email: email,
    Phone: phone,
    Stone: stoneName,
    Area: str(body.area) ? `${str(body.area)} ${str(body.areaUnit) || "m²"}` : null,
    Message: str(body.message),
  });

  return NextResponse.json({ ok: true, message: `Quote request sent for ${stoneName}.` });
}
