// Static data for the print catalogue / datasheet (ported from api/catalogue.php).
// All prose lives in the i18n message files (catalogue.* / datasheet.* keys,
// present in both en and fr) — this module only holds structural data.

export const TYPE_ORDER = ["Marble", "Onyx", "Limestone", "Travertine", "Granite", "Quartzite"];

export const STANDARD_SIZES = {
  Tiles: [
    { w: 30, h: 30 }, { w: 30, h: 60 }, { w: 45, h: 45 },
    { w: 45, h: 90 }, { w: 60, h: 60 },
  ],
  LargeTiles: [
    { w: 60, h: 120 }, { w: 80, h: 80 }, { w: 90, h: 90 }, { w: 100, h: 100 },
  ],
  Slabs: [
    { w: 120, h: 80 }, { w: 200, h: 160 }, { w: 260, h: 160 }, { w: 280, h: 160 },
  ],
};

export const TYPE_NAMES_MATRIX = ["Marble", "Onyx", "Limestone", "Travertine", "Granite", "Quartzite"];

// Application suitability: ✓ recommended · ⚠ care · ✘ not recommended.
// Row key → i18n key for the label.
export const APP_MATRIX: { key: string; label: string; row: Record<string, string> }[] = [
  { key: "catalogue.app_kitchen", label: "Kitchen Countertops", row: { Marble: "⚠", Onyx: "✘", Limestone: "✘", Travertine: "✘", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_bathroom", label: "Bathroom Vanities", row: { Marble: "✓", Onyx: "⚠", Limestone: "⚠", Travertine: "⚠", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_interior_flooring", label: "Interior Flooring", row: { Marble: "✓", Onyx: "✘", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_wall_cladding", label: "Wall Cladding", row: { Marble: "✓", Onyx: "✓", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_exterior_paving", label: "Exterior Paving", row: { Marble: "⚠", Onyx: "✘", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "⚠" } },
  { key: "catalogue.app_pool", label: "Pool Surrounds", row: { Marble: "⚠", Onyx: "✘", Limestone: "⚠", Travertine: "✓", Granite: "✓", Quartzite: "⚠" } },
  { key: "catalogue.app_facade", label: "Facades / Cladding", row: { Marble: "⚠", Onyx: "✘", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_traffic_flooring", label: "High-Traffic Flooring", row: { Marble: "⚠", Onyx: "✘", Limestone: "⚠", Travertine: "⚠", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_fireplace", label: "Fireplace Surrounds", row: { Marble: "✓", Onyx: "⚠", Limestone: "✓", Travertine: "✓", Granite: "✓", Quartzite: "✓" } },
  { key: "catalogue.app_backlit", label: "Backlit Features", row: { Marble: "⚠", Onyx: "✓", Limestone: "✘", Travertine: "✘", Granite: "✘", Quartzite: "⚠" } },
];

export const COUNTRY_REGIONS: Record<string, string> = {
  Brazil: "Espirito Santo, Minas Gerais, Rio Grande do Sul",
  France: "Provence, Nouvelle-Aquitaine",
  Greece: "Macedonia, Peloponnese, Drama",
  India: "Rajasthan, Karnataka, Andhra Pradesh",
  Iran: "Isfahan, Fars, East Azerbaijan",
  Italy: "Tuscany, Veneto, Apuan Alps, Sicily, Lombardy",
  Portugal: "Estremoz, Alentejo, Vila Vicosa",
  Spain: "Valencia, Alicante, Murcia, Catalonia",
  Tunisia: "Kasserine, Thala",
  Turkey: "Marmara, Aegean, Central Anatolia, Mediterranean",
};

const TONES: Record<string, { bg1: string; bg2: string; accent: string; text: string }> = {
  white: { bg1: "#f7f3ec", bg2: "#e6eef2", accent: "#4a8fa8", text: "#1e4d7b" },
  grey: { bg1: "#d1d5db", bg2: "#9ca3af", accent: "#6b7280", text: "#1f2937" },
  beige: { bg1: "#f5f0e8", bg2: "#e8dcc8", accent: "#b06b4a", text: "#5c3d2e" },
  black: { bg1: "#1f2937", bg2: "#111827", accent: "#f59e0b", text: "#f3f4f6" },
  green: { bg1: "#2d5016", bg2: "#1a3a0a", accent: "#a8c9d4", text: "#f0fdf4" },
  red: { bg1: "#7f1d1d", bg2: "#450a0a", accent: "#fca5a5", text: "#fef2f2" },
  yellow: { bg1: "#e8c84a", bg2: "#d4a843", accent: "#5c4033", text: "#292524" },
  brown: { bg1: "#5c4033", bg2: "#3e2723", accent: "#d4a574", text: "#fefce8" },
  pink: { bg1: "#e8b4b8", bg2: "#d4949a", accent: "#7f1d1d", text: "#4c0519" },
  blue: { bg1: "#1e3a5f", bg2: "#0f2440", accent: "#93c5fd", text: "#eff6ff" },
};

/** Generate an inline SVG data-URI placeholder for a stone without imagery.
 *  Ported from svgPlaceholder() — deterministic (no randomness) so server
 *  output is stable. */
export function svgPlaceholder(stone: {
  n?: string | null;
  ty?: string | null;
  c?: string | null;
  to?: string | null;
}): string {
  const c = TONES[stone.to || "beige"] || TONES.beige;
  const name = stone.n || "Natural Stone";
  const type = stone.ty || "Stone";
  const country = stone.c || "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 3);

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
    `<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">` +
    `<stop offset="0%" stop-color="${c.bg1}"/><stop offset="50%" stop-color="${c.bg2}"/><stop offset="100%" stop-color="${c.bg1}"/>` +
    `</linearGradient><radialGradient id="glow" cx="30%" cy="30%" r="70%">` +
    `<stop offset="0%" stop-color="${c.accent}" stop-opacity="0.15"/><stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<rect width="400" height="400" fill="url(#bg)"/><rect width="400" height="400" fill="url(#glow)"/>` +
    `<circle cx="110" cy="90" r="14" fill="${c.accent}" opacity="0.45"/>` +
    `<circle cx="300" cy="290" r="38" fill="${c.accent}" opacity="0.2"/>` +
    `<g transform="translate(200,200)">` +
    `<text text-anchor="middle" y="-30" font-family="Georgia,serif" font-size="65" font-weight="300" fill="${c.text}" opacity="0.85">${esc(initials)}</text>` +
    `<text text-anchor="middle" y="20" font-family="sans-serif" font-size="9" font-weight="300" letter-spacing="4" fill="${c.text}" opacity="0.6">${esc(type)}</text>` +
    `<text text-anchor="middle" y="45" font-family="sans-serif" font-size="6" font-weight="200" letter-spacing="3" fill="${c.text}" opacity="0.4">${esc(country)}</text>` +
    `<circle cx="0" cy="-60" r="60" fill="none" stroke="${c.accent}" stroke-width="0.5" opacity="0.2"/>` +
    `<circle cx="0" cy="-60" r="40" fill="none" stroke="${c.accent}" stroke-width="0.3" opacity="0.15"/>` +
    `</g></svg>`;

  const b64 = typeof Buffer !== "undefined" ? Buffer.from(svg).toString("base64") : btoa(svg);
  return `data:image/svg+xml;base64,${b64}`;
}
