import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";
import {
  computeItem,
  containersNeeded,
  containerDetail,
  zoneForCountry,
  estimateIncotermCosts,
  incotermByCode,
  type ItemInput,
} from "@/lib/proforma-engine";

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

interface RawItemInput {
  stoneId: string;
  grade: string;
  finish: string;
  categoryId: string;
  sizeIndex: number | null;
  customWidth: number;
  customHeight: number;
  thickness: string;
  area: number;
}

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rawItems: RawItemInput[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Add at least one stone item." }, { status: 400 });
  }
  if (!body.destinationCountry) {
    return NextResponse.json({ ok: false, error: "Select a destination country." }, { status: 400 });
  }
  if (!body.incoterm) {
    return NextResponse.json({ ok: false, error: "Select an incoterm." }, { status: 400 });
  }
  if (!body.paymentTerm) {
    return NextResponse.json({ ok: false, error: "Select a payment term." }, { status: 400 });
  }

  // Look up every stone's real price/name/image server-side — never trust
  // client-sent prices for the saved record.
  const stoneIds = [...new Set(rawItems.map((r) => r.stoneId))];
  const stoneRows = await prisma.stone.findMany({
    where: { id: { in: stoneIds } },
    select: { id: true, n: true, ty: true, c: true, g: true, p: true, pPremium: true },
  });
  const stoneMap = new Map(stoneRows.map((s) => [s.id, s]));

  const items = [];
  for (const r of rawItems) {
    const s = stoneMap.get(r.stoneId);
    if (!s) {
      return NextResponse.json({ ok: false, error: `Unknown stone: ${r.stoneId}` }, { status: 400 });
    }
    const gallery = Array.isArray(s.g) ? (s.g as string[]) : [];
    items.push(
      computeItem({
        stoneId: s.id,
        stoneName: s.n,
        stoneType: s.ty ?? "",
        stoneOrigin: s.c,
        stoneImage: gallery[0] ?? "",
        basePrice: s.p ?? 0,
        premiumPrice: s.pPremium ?? s.p ?? 0,
        grade: r.grade,
        finish: r.finish,
        categoryId: r.categoryId,
        sizeIndex: r.sizeIndex,
        customWidth: Number(r.customWidth) || 0,
        customHeight: Number(r.customHeight) || 0,
        thickness: r.thickness,
        areaOrLengthInput: Number(r.area) || 0,
      } satisfies ItemInput)
    );
  }

  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const totalM2 = items.reduce((s, it) => s + it.total_m2, 0);
  const containers = containersNeeded(items);
  const cDetail = containerDetail(items);

  const zone = zoneForCountry(body.destinationCountry);
  const shippingRate = zone?.rate_per_container_20ft ?? 0;
  const totalOceanFreight = containers * shippingRate;

  const costs = estimateIncotermCosts(body.incoterm, subtotal, containers, totalOceanFreight);
  const incoterm = incotermByCode(body.incoterm);

  const validUntil = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);
  const id = newProformaId();

  await prisma.proforma.create({
    data: {
      id,
      createdAt: nowStamp(),
      validUntil,
      unitSystem: body.unitSystem === "sqf" ? "sqf" : "sqm",
      clientId: client.id,
      client: body.client ?? {},
      destinationCountry: body.destinationCountry,
      destinationPort: body.destinationPort ?? null,
      incoterm: body.incoterm,
      incotermLabel: incoterm?.name ?? costs.incotermLabel,
      paymentTerm: body.paymentTerm,
      shippingZone: zone?.zone ?? null,
      shippingRatePerContainer: shippingRate,
      totalContainers: containers,
      containerDetail: JSON.parse(JSON.stringify(cDetail)),
      shippingDisclaimer:
        "Transportation costs are approximate estimates based on 20ft container freight rates from Izmir port. The number of containers required is calculated based on your order volume and thickness. Final shipping costs and container count will be confirmed by our logistics team once the order is confirmed. Rates are subject to change based on fuel prices, seasonal demand, and route availability.",
      totalM2,
      totalSqf: totalM2 * 10.7639,
      subtotal,
      shippingCost: costs.breakdown.find((b) => b.code === "freight")?.amount ?? 0,
      sellerFreight: costs.breakdown.find((b) => b.code === "freight")?.included ?? false,
      costBreakdown: JSON.parse(JSON.stringify(costs.breakdown)),
      totalAdditional: costs.totalAdditional,
      grandTotal: costs.grandTotal,
      items: JSON.parse(JSON.stringify(items)),
      notes: typeof body.notes === "string" ? body.notes : null,
      status: "draft",
    },
  });

  await logClientActivity(client.id, "created_proforma", id);
  return NextResponse.json({ ok: true, id });
}
