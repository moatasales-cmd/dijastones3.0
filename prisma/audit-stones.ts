/**
 * Stone-industry data audit — flags technically implausible specs per stone
 * type, missing fields, and internal inconsistencies. Read-only report.
 * Run: npx tsx prisma/audit-stones.ts
 */
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Accepted industry ranges (generous commercial bounds).
// Bounds tuned against the reviewed catalogue: dense compact limestones
// (Perlino, Ibiza, Moca) reach 0.1% absorption; Makrana marble tests 0.04%;
// commercial "granites" include syenites (Blue Bahia ~2,545 kg/m³); Turkish
// beige marbles bottom out around 55 MPa.
const RANGES: Record<
  string,
  { density: [number, number]; absorption: [number, number]; strength: [number, number] }
> = {
  Marble:     { density: [2550, 2900], absorption: [0.03, 0.8], strength: [55, 200] },
  Onyx:       { density: [2300, 2750], absorption: [0.05, 0.6], strength: [40, 120] },
  Limestone:  { density: [1800, 2750], absorption: [0.1, 6.0],  strength: [20, 200] },
  Travertine: { density: [2200, 2600], absorption: [0.4, 3.5],  strength: [20, 100] },
  Granite:    { density: [2540, 3050], absorption: [0.02, 0.6], strength: [90, 300] },
  Quartzite:  { density: [2500, 2850], absorption: [0.02, 0.7], strength: [100, 300] },
};

const num = (v: string | null | undefined) => {
  if (!v) return null;
  const m = String(v).replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

async function main() {
  const stones = await prisma.stone.findMany();
  const issues: string[] = [];
  const countries = new Map<string, number>();
  const seenNames = new Map<string, string>();

  for (const s of stones) {
    countries.set(s.c, (countries.get(s.c) ?? 0) + 1);
    const where = `${s.id} (${s.n}, ${s.ty}, ${s.c})`;

    // Duplicate display names
    if (seenNames.has(s.n)) issues.push(`DUPLICATE NAME: "${s.n}" in ${s.id} and ${seenNames.get(s.n)}`);
    seenNames.set(s.n, s.id);

    // Missing essentials
    for (const [k, v] of Object.entries({ ty: s.ty, to: s.to, cn: s.cn, d: s.d, ci: s.ci, r: s.r })) {
      if (!v) issues.push(`MISSING ${k}: ${where}`);
    }
    if (s.p == null) issues.push(`MISSING price: ${where}`);
    if (s.p != null && (s.p < 10 || s.p > 3000)) issues.push(`ODD PRICE $${s.p}: ${where}`);
    if (s.p != null && s.pPremium != null && s.pPremium <= s.p)
      issues.push(`PREMIUM<=BASE ($${s.pPremium} <= $${s.p}): ${where}`);

    const r = RANGES[s.ty ?? ""];
    if (r) {
      const d = num(s.density);
      const a = num(s.absorption);
      const st = num(s.strength);
      if (d != null && (d < r.density[0] || d > r.density[1]))
        issues.push(`DENSITY ${d} kg/m3 outside [${r.density}] for ${s.ty}: ${where} — "${s.density}"`);
      if (a != null && (a < r.absorption[0] || a > r.absorption[1]))
        issues.push(`ABSORPTION ${a}% outside [${r.absorption}] for ${s.ty}: ${where} — "${s.absorption}"`);
      if (st != null && (st < r.strength[0] || st > r.strength[1]))
        issues.push(`STRENGTH ${st} MPa outside [${r.strength}] for ${s.ty}: ${where} — "${s.strength}"`);
    } else if (s.ty) {
      issues.push(`UNKNOWN TYPE "${s.ty}": ${where}`);
    }

    // Units sanity
    if (s.density && !/kg\/?m/i.test(s.density)) issues.push(`DENSITY UNITS?: ${where} — "${s.density}"`);
    if (s.strength && !/MPa/i.test(s.strength)) issues.push(`STRENGTH UNITS?: ${where} — "${s.strength}"`);
    if (s.absorption && !/%/.test(s.absorption)) issues.push(`ABSORPTION UNITS?: ${where} — "${s.absorption}"`);
  }

  console.log(`Stones: ${stones.length}`);
  console.log(`Countries (${countries.size}): ${[...countries.entries()].map(([c, n]) => `${c}:${n}`).join(", ")}`);
  const types = new Map<string, number>();
  stones.forEach((s) => types.set(s.ty ?? "?", (types.get(s.ty ?? "?") ?? 0) + 1));
  console.log(`Types (${types.size}): ${[...types.entries()].map(([t, n]) => `${t}:${n}`).join(", ")}`);
  console.log(`\n--- ISSUES (${issues.length}) ---`);
  issues.forEach((i) => console.log(i));
}

main().finally(() => prisma.$disconnect());
