// Proforma pricing + container-packing engine.
// Config values come from config/sizes.json and config/shipping.json
// (the same reference data the old proforma.js used).
import sizes from "@/config/sizes.json";
import shipping from "@/config/shipping.json";

export const SQM_TO_SQF: number = sizes.sqm_to_sqf;
export const THICKNESSES = ["1 cm", "2 cm", "3 cm"] as const;
export const FINISHES = ["Polished", "Honed", "Leather", "Brushed"] as const;
export const GRADES = ["Standard", "Premium"] as const;

const containerCapacity: Record<string, { sqm: number; sqf: number }> = sizes.container_capacity;
const thicknessMult: Record<string, number> = sizes.thickness_multiplier;
const finishMult: Record<string, number> = sizes.finish_multiplier;
const gradeMult: Record<string, number> = sizes.grade_multiplier;

export interface ShippingZone {
  zone: string;
  countries: string[];
  rate_per_container_20ft: number;
  transit_days: string;
  note: string;
}
export const SHIPPING_ZONES: ShippingZone[] = shipping.zones;
export const SHIPPING_DISCLAIMER: string = shipping.disclaimer;

/** All destination countries, sorted. */
export const DESTINATION_COUNTRIES: string[] = [
  ...new Set(SHIPPING_ZONES.flatMap((z) => z.countries)),
].sort((a, b) => a.localeCompare(b));

export function zoneForCountry(country: string): ShippingZone | null {
  return SHIPPING_ZONES.find((z) => z.countries.includes(country)) ?? null;
}

// Incoterms (delivery) + payment terms.
export const INCOTERMS: { code: string; name: string }[] = [
  { code: "EXW", name: "Ex Works" },
  { code: "FCA", name: "Free Carrier" },
  { code: "FAS", name: "Free Alongside Ship" },
  { code: "FOB", name: "Free on Board" },
  { code: "CFR", name: "Cost and Freight" },
  { code: "CIF", name: "Cost, Insurance & Freight" },
  { code: "CPT", name: "Carriage Paid To" },
  { code: "CIP", name: "Carriage & Insurance Paid To" },
  { code: "DAP", name: "Delivered at Place" },
  { code: "DDP", name: "Delivered Duty Paid" },
];
export const PAYMENT_TERMS: { code: string; name: string }[] = [
  { code: "T/T", name: "T/T 30% Advance + 70% Before Shipment" },
  { code: "L/C", name: "Confirmed Irrevocable L/C at Sight" },
  { code: "CAD", name: "Cash Against Documents (C.A.D.)" },
];

/** Incoterms where the seller covers ocean freight (freight in the price). */
const SELLER_FREIGHT = new Set(["CFR", "CIF", "CPT", "CIP", "DAP", "DDP"]);
export function sellerCoversFreight(incoterm: string): boolean {
  return SELLER_FREIGHT.has(incoterm);
}

export interface LineItem {
  stoneId: string;
  stoneName: string;
  basePrice: number; // per m², standard grade
  thickness: string;
  finish: string;
  grade: string;
  area: number; // in m²
}

/** Unit price per m² after thickness / finish / grade multipliers. */
export function unitPrice(item: Pick<LineItem, "basePrice" | "thickness" | "finish" | "grade">): number {
  const tm = thicknessMult[item.thickness] ?? 1;
  const fm = finishMult[item.finish] ?? 1;
  const gm = gradeMult[item.grade] ?? 1;
  return item.basePrice * tm * fm * gm;
}

export function lineTotal(item: LineItem): number {
  return unitPrice(item) * item.area;
}

/** Total 20ft containers, packed per thickness (each thickness packs separately). */
export function containersNeeded(items: LineItem[]): number {
  const byThickness: Record<string, number> = {};
  for (const it of items) {
    byThickness[it.thickness] = (byThickness[it.thickness] ?? 0) + it.area;
  }
  let total = 0;
  for (const [thickness, area] of Object.entries(byThickness)) {
    const cap = containerCapacity[thickness]?.sqm ?? 450;
    total += Math.ceil(area / cap);
  }
  return total;
}

export interface ProformaTotals {
  totalArea: number;
  subtotal: number;
  containers: number;
  shippingRate: number;
  shippingCost: number;
  sellerFreight: boolean;
  grandTotal: number;
}

export function computeTotals(
  items: LineItem[],
  country: string,
  incoterm: string
): ProformaTotals {
  const totalArea = items.reduce((s, it) => s + it.area, 0);
  const subtotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const containers = containersNeeded(items);
  const zone = zoneForCountry(country);
  const shippingRate = zone?.rate_per_container_20ft ?? 0;
  const shippingCost = containers * shippingRate;
  const sellerFreight = sellerCoversFreight(incoterm);
  const grandTotal = subtotal + (sellerFreight ? shippingCost : 0);
  return { totalArea, subtotal, containers, shippingRate, shippingCost, sellerFreight, grandTotal };
}
