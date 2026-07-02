// Full proforma calculation engine — ported from inc/incoterms.php + the old
// site's size-category system (config/sizes.json). This is the single source
// of truth for pricing, sizes, incoterms, and cost-breakdown math shared by
// the builder UI, the save API, the invoice view, and the PDF/email export.
import sizesRaw from "@/config/sizes.json";
import portsRaw from "@/config/ports.json";
import shippingRaw from "@/config/shipping.json";

export const SQM_TO_SQF: number = sizesRaw.sqm_to_sqf;

// ── Size categories (tiles/slabs/mosaic/steps/etc., each with named sizes
//    and per-size available thicknesses) ──
export interface SizeOption {
  l: string; // label, e.g. "30×60 cm"
  w: number; // cm
  h: number; // cm
  t: string[]; // available thicknesses for this size
}
export interface SizeCategory {
  id: string;
  name: string;
  multiplier: number;
  sizes: SizeOption[];
}

function loadCategories(raw: unknown): SizeCategory[] {
  return Object.values(raw as Record<string, unknown>) as SizeCategory[];
}
export const SIZE_CATEGORIES_METRIC: SizeCategory[] = loadCategories(sizesRaw.categories_metric);
export const SIZE_CATEGORIES_IMPERIAL: SizeCategory[] = loadCategories(sizesRaw.categories_imperial);
export const CATEGORY_BY_ID = new Map(SIZE_CATEGORIES_METRIC.map((c) => [c.id, c]));

export const THICKNESS_MULTIPLIER: Record<string, number> = sizesRaw.thickness_multiplier;
export const FINISH_MULTIPLIER: Record<string, number> = sizesRaw.finish_multiplier;
export const GRADE_MULTIPLIER: Record<string, number> = sizesRaw.grade_multiplier;
export const CONTAINER_CAPACITY: Record<string, { sqm: number; sqf: number }> = sizesRaw.container_capacity;
export const FINISHES = Object.keys(FINISH_MULTIPLIER);
export const GRADES = Object.keys(GRADE_MULTIPLIER);
export const CUSTOM_SIZE_MULTIPLIER = 1.2;

// ── Shipping zones (destination country → zone → rate/transit) ──
export interface ShippingZone {
  zone: string;
  countries: string[];
  rate_per_container_20ft: number;
  transit_days: string;
  note: string;
}
export const SHIPPING_ZONES: ShippingZone[] = shippingRaw.zones;
export const SHIPPING_DISCLAIMER: string = shippingRaw.disclaimer;
export const DESTINATION_COUNTRIES: string[] = [
  ...new Set(SHIPPING_ZONES.flatMap((z) => z.countries)),
].sort((a, b) => a.localeCompare(b));
export function zoneForCountry(country: string): ShippingZone | null {
  return SHIPPING_ZONES.find((z) => z.countries.includes(country)) ?? null;
}

// ── Destination ports (country → list of ports) ──
export const DESTINATION_PORTS: Record<string, string[]> = portsRaw.destination_ports as Record<
  string,
  string[]
>;

// ── Incoterms ──
export interface Incoterm {
  code: string;
  name: string;
  description: string;
  buyer_responsibility: string;
  seller_responsibility: string;
  risk_transfer: string;
}
export const INCOTERMS: Incoterm[] = [
  { code: "EXW", name: "Ex Works", description: "Buyer collects goods from our atelier in Izmir, Turkey. Buyer assumes all costs and risks from our door onward.", buyer_responsibility: "All transportation, insurance, export/import customs, duties", seller_responsibility: "Goods made available at our premises", risk_transfer: "At our premises in Izmir" },
  { code: "FCA", name: "Free Carrier", description: "Seller delivers goods to the carrier or another person nominated by buyer at seller's premises or another named place.", buyer_responsibility: "Main carriage, insurance, import customs, duties", seller_responsibility: "Export packing, delivery to carrier, export customs", risk_transfer: "When goods are delivered to carrier at named place" },
  { code: "FAS", name: "Free Alongside Ship", description: "Seller delivers goods alongside the vessel at the port of loading. Buyer assumes all costs and risks from that point.", buyer_responsibility: "Loading, ocean freight, insurance, import customs, duties", seller_responsibility: "Export packing, inland freight to port, export customs", risk_transfer: "When goods are alongside the vessel at origin port" },
  { code: "FOB", name: "Free on Board", description: "Seller delivers goods on board the vessel nominated by buyer at the port of loading. Buyer assumes all costs and risks once goods are on board.", buyer_responsibility: "Ocean freight, insurance, import customs, duties, destination handling", seller_responsibility: "Export packing, inland freight to port, export customs, loading", risk_transfer: "When goods are on board the vessel at origin port" },
  { code: "CFR", name: "Cost and Freight", description: "Seller covers the cost and freight to bring goods to the destination port. Risk transfers to buyer once goods are on board at origin.", buyer_responsibility: "Insurance (recommended), import customs, duties, destination handling", seller_responsibility: "Export packing, inland freight, export customs, loading, ocean freight", risk_transfer: "At origin port when goods are on board (seller bears cost but not risk after loading)" },
  { code: "CIF", name: "Cost, Insurance & Freight", description: "Seller covers cost, insurance, and freight to the destination port. Risk transfers to buyer once goods are on board at origin.", buyer_responsibility: "Import customs, duties, local taxes, destination handling", seller_responsibility: "Export packing, inland freight, export customs, loading, ocean freight, marine insurance", risk_transfer: "At origin port when goods are on board (seller bears cost but not risk after loading)" },
  { code: "CPT", name: "Carriage Paid To", description: "Seller pays carriage to the named destination. Risk transfers to buyer when goods are handed to the first carrier.", buyer_responsibility: "Insurance (recommended), import customs, duties", seller_responsibility: "Export packing, inland freight, export customs, loading, main carriage, destination delivery", risk_transfer: "When goods are handed to first carrier" },
  { code: "CIP", name: "Carriage & Insurance Paid To", description: "Seller pays carriage and insurance to the named destination. Risk transfers to buyer when goods are handed to the first carrier.", buyer_responsibility: "Import customs, duties", seller_responsibility: "Export packing, inland freight, export customs, loading, main carriage, insurance, destination delivery", risk_transfer: "When goods are handed to first carrier" },
  { code: "DAP", name: "Delivered at Place", description: "Seller delivers goods to the buyer's named place of destination. Seller bears all risks and costs up to delivery (excluding import clearance).", buyer_responsibility: "Import customs clearance, duties, taxes, unloading at destination", seller_responsibility: "All transportation, insurance, export customs, freight to destination", risk_transfer: "At buyer's named place of destination" },
  { code: "DDP", name: "Delivered Duty Paid", description: "Seller delivers goods to the buyer's named place, cleared for import, with all duties and taxes paid. Maximum seller obligation.", buyer_responsibility: "Unloading at destination", seller_responsibility: "All transportation, insurance, export/import customs, duties, taxes, delivery to named place", risk_transfer: "At buyer's named place of destination" },
];
export const incotermByCode = (code: string) => INCOTERMS.find((i) => i.code === code) ?? null;

export interface PaymentTerm {
  code: string;
  name: string;
  description: string;
  requirements: string;
}
export const PAYMENT_TERMS: PaymentTerm[] = [
  { code: "TT_30_70", name: "T/T 30% Advance + 70% Before Shipment", description: "30% of the total invoice value is paid by bank wire transfer as a down payment upon proforma confirmation. The remaining 70% is paid before the goods leave our warehouse / port of loading.", requirements: "Standard for new clients. Proforma valid for 14 days." },
  { code: "LC_SIGHT", name: "Confirmed Irrevocable L/C at Sight", description: "Confirmed, irrevocable, and transferable Letter of Credit payable at sight. The full amount is paid upon presentation of shipping documents (bill of lading, commercial invoice, packing list).", requirements: "L/C must be confirmed by a prime bank acceptable to DIJA. Valid for 60 days after issuance." },
  { code: "CAD", name: "Cash Against Documents (C.A.D.)", description: "Buyer pays the full invoice amount at the bank of the seller's agent in exchange for the original shipping documents (bill of lading, commercial invoice, packing list, certificate of origin).", requirements: "Available only after export manager confirmation and established relationship. Subject to credit evaluation." },
];
export const paymentTermByCode = (code: string) => PAYMENT_TERMS.find((p) => p.code === code) ?? null;

// ── Incoterm → which cost legs the seller's price already includes ──
interface CostMatrixRow {
  label: string;
  packing: boolean;
  inland: boolean;
  customs: boolean;
  loading: boolean;
  freight: boolean;
  insurance: boolean;
  import: boolean;
  delivery: boolean;
}
const COST_MATRIX: Record<string, CostMatrixRow> = {
  EXW: { label: "Ex Works", packing: false, inland: false, customs: false, loading: false, freight: false, insurance: false, import: false, delivery: false },
  FCA: { label: "Free Carrier", packing: true, inland: true, customs: true, loading: false, freight: false, insurance: false, import: false, delivery: false },
  FAS: { label: "Free Alongside Ship", packing: true, inland: true, customs: true, loading: false, freight: false, insurance: false, import: false, delivery: false },
  FOB: { label: "Free on Board", packing: true, inland: true, customs: true, loading: true, freight: false, insurance: false, import: false, delivery: false },
  CFR: { label: "Cost and Freight", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: false, import: false, delivery: false },
  CIF: { label: "Cost, Insurance & Freight", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: true, import: false, delivery: false },
  CPT: { label: "Carriage Paid To", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: false, import: false, delivery: true },
  CIP: { label: "Carriage & Insurance Paid To", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: true, import: false, delivery: true },
  DAP: { label: "Delivered at Place", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: true, import: false, delivery: true },
  DDP: { label: "Delivered Duty Paid", packing: true, inland: true, customs: true, loading: true, freight: true, insurance: true, import: true, delivery: true },
};
export function sellerCoversFreight(incoterm: string): boolean {
  return COST_MATRIX[incoterm]?.freight ?? false;
}

interface CostEstimates {
  packing_pct: number;
  inland_per_container: number;
  export_customs_flat: number;
  loading_per_container: number;
  insurance_pct: number;
  import_duty_pct: number;
  delivery_per_container: number;
}
const COST_ESTIMATES: CostEstimates = portsRaw.cost_estimates as CostEstimates;

export interface CostBreakdownLine {
  code: string;
  label: string;
  amount: number;
  included: boolean;
}
export interface IncotermCosts {
  breakdown: CostBreakdownLine[];
  subtotal: number;
  totalAdditional: number;
  grandTotal: number;
  incotermLabel: string;
}

/** Full landed-cost estimate for an incoterm — mirrors estimateIncotermCosts(). */
export function estimateIncotermCosts(
  incoterm: string,
  subtotal: number,
  totalContainers: number,
  totalOceanFreight: number
): IncotermCosts {
  const m = COST_MATRIX[incoterm] ?? COST_MATRIX.EXW;
  const e = COST_ESTIMATES;

  const packing = m.packing ? round2((subtotal * e.packing_pct) / 100) : 0;
  const inland = m.inland ? round2(totalContainers * e.inland_per_container) : 0;
  const customs = m.customs ? e.export_customs_flat : 0;
  const loading = m.loading ? round2(totalContainers * e.loading_per_container) : 0;
  const freight = m.freight ? totalOceanFreight : 0;
  const insurance = m.insurance ? round2(((subtotal + freight) * e.insurance_pct) / 100) : 0;
  const importDuty = m.import ? round2(((subtotal + freight + insurance) * e.import_duty_pct) / 100) : 0;
  const delivery = m.delivery ? round2(totalContainers * e.delivery_per_container) : 0;

  const breakdown: CostBreakdownLine[] = [
    { code: "packing", label: "Packing & Crating", amount: packing, included: m.packing },
    { code: "inland", label: "Inland Freight to Port", amount: inland, included: m.inland },
    { code: "customs", label: "Export Customs Clearance", amount: customs, included: m.customs },
    { code: "loading", label: "Port Loading", amount: loading, included: m.loading },
    { code: "freight", label: "Ocean Freight", amount: freight, included: m.freight },
    { code: "insurance", label: "Marine Insurance", amount: insurance, included: m.insurance },
    { code: "import", label: "Import Duties & Taxes (5% of CIF)", amount: importDuty, included: m.import },
    { code: "delivery", label: "Destination Delivery", amount: delivery, included: m.delivery },
  ];
  const totalAdditional = packing + inland + customs + loading + freight + insurance + importDuty + delivery;
  const grandTotal = round2(subtotal + totalAdditional);

  return { breakdown, subtotal, totalAdditional, grandTotal, incotermLabel: m.label };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Line items ──────────────────────────────────────────────────────────
// One consistent shape used everywhere going forward (builder, save API,
// invoice, PDF). Mirrors the old site's field names 1:1 so proformas created
// here and proformas migrated from the old site are indistinguishable.
export interface ProformaItem {
  stone_id: string;
  stone_name: string;
  stone_type: string;
  stone_origin: string;
  stone_image: string;
  grade: string;
  finish: string;
  category: string; // category id, or "custom"
  category_name: string; // display name
  size_label: string;
  width_cm: number;
  height_cm: number;
  is_custom: boolean;
  thickness: string;
  base_price: number;
  thickness_multiplier: number;
  size_multiplier: number; // category multiplier (or 1.2 for custom)
  finish_multiplier: number;
  grade_multiplier: number;
  adjusted_unit_price: number; // $/m²
  area_per_piece_m2: number;
  pieces: number;
  total_m2: number;
  line_total: number;
}

export interface ItemInput {
  stoneId: string;
  stoneName: string;
  stoneType: string;
  stoneOrigin: string;
  stoneImage: string;
  /** Standard-grade $/m². */
  basePrice: number;
  /** Premium-grade $/m² (falls back to basePrice if the stone has no premium tier). */
  premiumPrice: number;
  grade: string;
  finish: string;
  categoryId: string; // "" | "custom" | a SIZE_CATEGORIES_METRIC id
  sizeIndex: number | null; // index into category.sizes, or null for custom
  customWidth: number;
  customHeight: number;
  thickness: string;
  areaOrLengthInput: number; // total area (m²) the client wants, entered directly
}

/**
 * Compute a full priced line item from builder input.
 *
 * Grade is NOT a multiplier — it selects between the stone's two absolute
 * catalogue prices (standard vs premium), exactly like the old site. The
 * `grade_multiplier` values in config/sizes.json are legacy/unused config
 * (confirmed against the old proforma.js: `basePrice = grade === 'Premium'
 * ? stone.p_premium : stone.p`, with no further grade factor applied).
 */
export function computeItem(input: ItemInput): ProformaItem {
  const isCustom = input.categoryId === "custom" || input.categoryId === "";
  const category = !isCustom ? CATEGORY_BY_ID.get(input.categoryId) : undefined;
  const size = category && input.sizeIndex != null ? category.sizes[input.sizeIndex] : undefined;

  const width = isCustom ? input.customWidth : size?.w ?? 0;
  const height = isCustom ? input.customHeight : size?.h ?? 0;
  const areaPerPiece = width > 0 && height > 0 ? (width * height) / 10000 : 0;

  const sizeMultiplier = isCustom ? CUSTOM_SIZE_MULTIPLIER : category?.multiplier ?? 1;
  const thicknessMultiplier = THICKNESS_MULTIPLIER[input.thickness] ?? 1;
  const finishMultiplier = FINISH_MULTIPLIER[input.finish] ?? 1;

  const gradePrice =
    input.grade === "Premium" && input.premiumPrice > 0 ? input.premiumPrice : input.basePrice;

  const unitPrice = round2(gradePrice * thicknessMultiplier * finishMultiplier * sizeMultiplier);

  const totalM2 = input.areaOrLengthInput;
  const pieces = areaPerPiece > 0 ? Math.ceil(totalM2 / areaPerPiece) : 0;
  const lineTotal = round2(unitPrice * totalM2);

  const sizeLabel = isCustom
    ? `${width}×${height} cm (Custom)`
    : size
      ? `${size.l}`
      : "—";

  return {
    stone_id: input.stoneId,
    stone_name: input.stoneName,
    stone_type: input.stoneType,
    stone_origin: input.stoneOrigin,
    stone_image: input.stoneImage,
    grade: input.grade,
    finish: input.finish,
    category: isCustom ? "custom" : input.categoryId,
    category_name: isCustom ? "Custom Size" : category?.name ?? "—",
    size_label: sizeLabel,
    width_cm: width,
    height_cm: height,
    is_custom: isCustom,
    thickness: input.thickness,
    base_price: gradePrice,
    thickness_multiplier: thicknessMultiplier,
    size_multiplier: sizeMultiplier,
    finish_multiplier: finishMultiplier,
    grade_multiplier: 1,
    adjusted_unit_price: unitPrice,
    area_per_piece_m2: areaPerPiece,
    pieces,
    total_m2: totalM2,
    line_total: lineTotal,
  };
}

/** Containers needed, packed per thickness (each thickness packs separately). */
export function containersNeeded(items: ProformaItem[]): number {
  const byThickness: Record<string, number> = {};
  for (const it of items) byThickness[it.thickness] = (byThickness[it.thickness] ?? 0) + it.total_m2;
  let total = 0;
  for (const [thickness, area] of Object.entries(byThickness)) {
    const cap = CONTAINER_CAPACITY[thickness]?.sqm ?? 450;
    total += Math.ceil(area / cap);
  }
  return total;
}

export interface ContainerDetailLine {
  thickness: string;
  area_m2: number;
  capacity_m2: number;
  containers: number;
}
export function containerDetail(items: ProformaItem[]): ContainerDetailLine[] {
  const byThickness: Record<string, number> = {};
  for (const it of items) byThickness[it.thickness] = (byThickness[it.thickness] ?? 0) + it.total_m2;
  return Object.entries(byThickness).map(([thickness, area]) => {
    const cap = CONTAINER_CAPACITY[thickness]?.sqm ?? 450;
    return { thickness, area_m2: round2(area), capacity_m2: cap, containers: Math.ceil(area / cap) };
  });
}
