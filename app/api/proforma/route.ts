import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";
import { buildProformaData, type ProformaBody } from "@/lib/proforma-save";

function newProformaId() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const ymd = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  return `DIJA-${ymd}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, proformas: [] }, { status: 401 });
  const proformas = await prisma.proforma.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, destinationCountry: true, grandTotal: true, status: true, incoterm: true },
  });
  return NextResponse.json({ ok: true, proformas });
}

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });

  const body: ProformaBody = await req.json().catch(() => ({}));
  const { error, data } = await buildProformaData(body);
  if (error || !data) return NextResponse.json({ ok: false, error }, { status: 400 });

  const validUntil = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);
  const id = newProformaId();

  await prisma.proforma.create({
    data: {
      id,
      createdAt: nowStamp(),
      validUntil,
      clientId: client.id,
      status: "draft",
      ...data,
    },
  });

  await logClientActivity(client.id, "created_proforma", id);
  return NextResponse.json({ ok: true, id });
}
