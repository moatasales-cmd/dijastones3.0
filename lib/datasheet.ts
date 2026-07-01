// Data + helpers for the single-stone print datasheet (ported from api/datasheet.php).
// Prose lives in the i18n message files (datasheet.* keys, en + fr).

export const MOHS_MAP: Record<string, string> = {
  Marble: "3–4", Onyx: "3", Limestone: "3–4", Travertine: "3–4", Granite: "6–7", Quartzite: "7",
};

export const SLIP_BY_TYPE: Record<string, string> = {
  Granite: "DCOF ≥ 0.42 (wet)", Quartzite: "DCOF ≥ 0.42 (wet)", Marble: "DCOF ≥ 0.35 (wet)",
  Limestone: "DCOF ≥ 0.40 (wet)", Travertine: "DCOF ≥ 0.45 (wet)", Onyx: "DCOF ≥ 0.30 (wet)",
};

// Abbreviations used in the datasheet.limit_<abbr>_<facet> keys.
export const LIMIT_ABBR: Record<string, string> = {
  Marble: "marble", Onyx: "onyx", Limestone: "lime", Travertine: "trav", Granite: "gran", Quartzite: "qtzt",
};

// Application suitability rows: i18n label key + per-type icon.
export const DS_APP_MATRIX: { labelKey: string; row: Record<string, string> }[] = [
  { labelKey: "datasheet.app_kitchen", row: { Marble: "⚠", Onyx: "✘", Limestone: "✘", Travertine: "✘", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_bathroom", row: { Marble: "✓", Onyx: "⚠", Limestone: "⚠", Travertine: "⚠", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_flooring", row: { Marble: "✓", Onyx: "✘", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_wall", row: { Marble: "✓", Onyx: "✓", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_exterior", row: { Marble: "⚠", Onyx: "✘", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "⚠" } },
  { labelKey: "datasheet.app_pool", row: { Marble: "⚠", Onyx: "✘", Limestone: "⚠", Travertine: "✓", Granite: "✓", Quartzite: "⚠" } },
  { labelKey: "datasheet.app_traffic", row: { Marble: "⚠", Onyx: "✘", Limestone: "⚠", Travertine: "⚠", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_fireplace", row: { Marble: "✓", Onyx: "⚠", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { labelKey: "datasheet.app_backlit", row: { Marble: "⚠", Onyx: "✓", Limestone: "✘", Travertine: "✘", Granite: "✘", Quartzite: "⚠" } },
];

export const appClass = (icon: string) => (icon === "✓" ? "yes" : icon === "⚠" ? "cond" : "no");

export function densityLbs(density: string | null | undefined): string {
  const v = parseFloat((density || "").split(" ")[0].replace(/,/g, "")) || 0;
  return v > 0 ? `${Math.round(v / 16.018)} lbs/ft³` : "—";
}

export function strengthPsi(strength: string | null | undefined): string {
  const v = parseFloat((strength || "").split(" ")[0].replace(/,/g, "")) || 0;
  return v > 0 ? `${Math.round(v * 145.038)} psi` : "—";
}

/** i18n key for the absorption class band. */
export function absClassKey(absorption: string | null | undefined): string {
  const v = parseFloat((absorption || "").replace(/%/g, "")) || 0;
  if (v <= 0.1) return "datasheet.abs_very_low";
  if (v <= 0.5) return "datasheet.abs_low";
  if (v <= 1.0) return "datasheet.abs_moderate";
  if (v <= 3.0) return "datasheet.abs_high";
  return "datasheet.abs_very_high";
}
