import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { zoneForCountry } from "@/lib/proforma";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";

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

  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "No items." }, { status: 400 });
  }

  const validUntil = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);
  const zone = body.destinationCountry ? zoneForCountry(body.destinationCountry) : null;
  const id = newProformaId();

  await prisma.proforma.create({
    data: {
      id,
      createdAt: nowStamp(),
      validUntil,
      unitSystem: body.unitSystem ?? "sqm",
      clientId: client.id,
      client: body.client ?? {},
      destinationCountry: body.destinationCountry ?? null,
      incoterm: body.incoterm ?? null,
      paymentTerm: body.paymentTerm ?? null,
      shippingZone: zone?.zone ?? null,
      shippingRatePerContainer: body.shippingRate ?? null,
      totalContainers: body.containers ?? null,
      totalM2: body.totalArea ?? null,
      subtotal: body.subtotal ?? null,
      shippingCost: body.shippingCost ?? null,
      sellerFreight: !!body.sellerFreight,
      grandTotal: body.grandTotal ?? null,
      items,
      status: "draft",
    },
  });

  await logClientActivity(client.id, "created_proforma", id);
  return NextResponse.json({ ok: true, id });
}
