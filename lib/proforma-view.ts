import "server-only";
import { incotermByCode, paymentTermByCode } from "@/lib/proforma-engine";

// Shared read-side model for a saved Proforma record — used by both the
// on-screen invoice (app/(site)/proforma/[id]/page.tsx) and the PDF/email
// generator (lib/proforma-pdf.tsx), so what the client sees on screen and
// what gets emailed as a PDF are always identical.

export const money = (v: number | null | undefined) =>
  "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v ?? "")) || 0);
const str = (v: unknown, fallback = "—") => (typeof v === "string" && v ? v : fallback);

// Raw line-item shape as stored in the DB. Two schemas exist: the current
// builder (rich, old-site-compatible field names) and — for a handful of
// still-legacy rows — the exact same names, since Phase-"proforma rework"
// aligned the new schema to match the old site's fields 1:1. A couple of
// alternate spellings from the very first Next.js rebuild are also handled
// so nothing that already got saved ever breaks.
export interface RawItem {
  stone_id?: string;
  stone_name?: string;
  stoneName?: string;
  stone_type?: string;
  stone_origin?: string;
  stone_image?: string;
  grade?: string;
  finish?: string;
  category?: string;
  category_name?: string;
  size_label?: string;
  width_cm?: number;
  height_cm?: number;
  is_custom?: boolean;
  thickness?: string;
  base_price?: number;
  adjusted_unit_price?: number;
  unitPrice?: number;
  area_per_piece_m2?: number;
  pieces?: number;
  total_m2?: number;
  area?: number;
  area_m2?: number;
  line_total?: number;
  lineTotal?: number;
}

export interface ViewItem {
  stoneName: string;
  stoneType: string;
  stoneOrigin: string;
  stoneImage: string;
  grade: string;
  finish: string;
  categoryName: string;
  sizeLabel: string;
  thickness: string;
  unitPrice: number;
  areaPerPiece: number;
  pieces: number;
  totalArea: number;
  lineTotal: number;
}

export function normalizeItem(it: RawItem): ViewItem {
  return {
    stoneName: str(it.stoneName ?? it.stone_name),
    stoneType: str(it.stone_type, ""),
    stoneOrigin: str(it.stone_origin, ""),
    stoneImage: str(it.stone_image, ""),
    grade: str(it.grade, "Standard"),
    finish: str(it.finish, "Polished"),
    categoryName: str(it.category_name, str(it.category, "")),
    sizeLabel: str(it.size_label),
    thickness: str(it.thickness),
    unitPrice: num(it.adjusted_unit_price ?? it.unitPrice),
    areaPerPiece: num(it.area_per_piece_m2),
    pieces: num(it.pieces),
    totalArea: num(it.total_m2 ?? it.area ?? it.area_m2),
    lineTotal: num(it.line_total ?? it.lineTotal),
  };
}

export interface ViewClient {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export function normalizeClient(c: unknown): ViewClient {
  const o = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
  return {
    name: str(o.name, ""),
    email: str(o.email, ""),
    company: str(o.company, ""),
    phone: str(o.phone, ""),
    address: str(o.address, ""),
    city: str(o.city, ""),
    country: str(o.country, ""),
  };
}

export interface ViewContainerLine {
  thickness: string;
  areaM2: number;
  capacityM2: number;
  containers: number;
}
export function normalizeContainers(raw: unknown): ViewContainerLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => ({
    thickness: str((c as Record<string, unknown>).thickness),
    areaM2: num((c as Record<string, unknown>).area_m2),
    capacityM2: num((c as Record<string, unknown>).capacity_m2),
    containers: num((c as Record<string, unknown>).containers),
  }));
}

export interface ViewCostLine {
  code: string;
  label: string;
  amount: number;
  included: boolean;
}
export function normalizeCostBreakdown(raw: unknown): ViewCostLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => {
    const o = c as Record<string, unknown>;
    return {
      code: str(o.code, ""),
      label: str(o.label, ""),
      amount: num(o.amount),
      included: !!o.included,
    };
  });
}

/** Everything the invoice/PDF templates need, fully normalized. */
export function buildInvoiceView(pf: {
  id: string;
  createdAt: string | null;
  validUntil: string | null;
  unitSystem: string | null;
  client: unknown;
  destinationCountry: string | null;
  destinationPort: string | null;
  incoterm: string | null;
  incotermLabel: string | null;
  paymentTerm: string | null;
  shippingZone: string | null;
  totalContainers: number | null;
  containerDetail: unknown;
  shippingNote: string | null;
  shippingDisclaimer: string | null;
  totalM2: number | null;
  subtotal: number | null;
  shippingCost: number | null;
  costBreakdown: unknown;
  grandTotal: number | null;
  items: unknown;
  notes: string | null;
  status: string | null;
}) {
  const items = (Array.isArray(pf.items) ? (pf.items as RawItem[]) : []).map(normalizeItem);
  const client = normalizeClient(pf.client);
  const containers = normalizeContainers(pf.containerDetail);
  const costBreakdown = normalizeCostBreakdown(pf.costBreakdown);
  const incoterm = pf.incoterm ? incotermByCode(pf.incoterm) : null;
  const paymentTerm = pf.paymentTerm ? paymentTermByCode(pf.paymentTerm) : null;
  const grandTotal = num(pf.grandTotal);
  const sys = pf.unitSystem === "sqf" ? "sqf" : "sqm";

  return {
    id: pf.id,
    createdAt: pf.createdAt ?? "",
    validUntil: pf.validUntil ?? "",
    unitSystem: sys,
    client,
    destinationCountry: pf.destinationCountry ?? "",
    destinationPort: pf.destinationPort ?? "",
    incoterm: pf.incoterm ?? "",
    incotermLabel: pf.incotermLabel ?? incoterm?.name ?? "",
    incotermDescription: incoterm?.description ?? "",
    paymentTerm: pf.paymentTerm ?? "",
    paymentTermName: paymentTerm?.name ?? "",
    paymentTermDescription: paymentTerm?.description ?? "",
    paymentTermRequirements: paymentTerm?.requirements ?? "",
    shippingZone: pf.shippingZone ?? "",
    totalContainers: num(pf.totalContainers),
    containers,
    shippingNote: pf.shippingNote ?? "",
    shippingDisclaimer: pf.shippingDisclaimer ?? "",
    totalM2: num(pf.totalM2),
    subtotal: num(pf.subtotal),
    shippingCost: num(pf.shippingCost),
    costBreakdown,
    grandTotal,
    advancePayment: round2(grandTotal * 0.3),
    balancePayment: round2(grandTotal * 0.7),
    items,
    notes: pf.notes ?? "",
    status: pf.status ?? "draft",
  };
}
export type InvoiceView = ReturnType<typeof buildInvoiceView>;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
