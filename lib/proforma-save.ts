import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeItem,
  containersNeeded,
  containerDetail,
  zoneForCountry,
  estimateIncotermCosts,
  incotermByCode,
  type ItemInput,
} from "@/lib/proforma-engine";

export interface RawItemInput {
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

export interface ProformaBody {
  unitSystem?: string;
  client?: unknown;
  destinationCountry?: string;
  destinationPort?: string;
  incoterm?: string;
  paymentTerm?: string;
  notes?: string;
  items?: RawItemInput[];
}

/**
 * Shared validation + pricing pipeline used by both create (POST) and
 * edit (PATCH) — guarantees an edited proforma is priced by the exact same
 * server-side logic as a brand new one (real stone prices looked up from
 * the DB, never trusting client-submitted numbers).
 */
export async function buildProformaData(body: ProformaBody) {
  const rawItems: RawItemInput[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) return { error: "Add at least one stone item." };
  if (!body.destinationCountry) return { error: "Select a destination country." };
  if (!body.incoterm) return { error: "Select an incoterm." };
  if (!body.paymentTerm) return { error: "Select a payment term." };

  const stoneIds = [...new Set(rawItems.map((r) => r.stoneId))];
  const stoneRows = await prisma.stone.findMany({
    where: { id: { in: stoneIds } },
    select: { id: true, n: true, ty: true, c: true, g: true, p: true, pPremium: true },
  });
  const stoneMap = new Map(stoneRows.map((s) => [s.id, s]));

  const items = [];
  for (const r of rawItems) {
    const s = stoneMap.get(r.stoneId);
    if (!s) return { error: `Unknown stone: ${r.stoneId}` };
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

  const zone = zoneForCountry(body.destinationCountry!);
  const shippingRate = zone?.rate_per_container_20ft ?? 0;
  const totalOceanFreight = containers * shippingRate;

  const costs = estimateIncotermCosts(body.incoterm!, subtotal, containers, totalOceanFreight);
  const incoterm = incotermByCode(body.incoterm!);

  const data = {
    unitSystem: body.unitSystem === "sqf" ? "sqf" : "sqm",
    client: (body.client ?? {}) as object,
    destinationCountry: body.destinationCountry!,
    destinationPort: body.destinationPort ?? null,
    incoterm: body.incoterm!,
    incotermLabel: incoterm?.name ?? costs.incotermLabel,
    paymentTerm: body.paymentTerm!,
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
  };

  return { data };
}
