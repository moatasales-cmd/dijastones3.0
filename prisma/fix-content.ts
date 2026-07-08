/**
 * Expert content corrections (one-time, idempotent):
 * 1. Slip-resistance labels: wet pendulum values ≤15 are polished-finish
 *    numbers — records saying "(honed)" with Wet ≤15 are relabeled
 *    "(polished)". Honed marble tests ~35–47 wet (cf. Statuario's entry
 *    and the catalogue glossary: SRV ≥36 for pedestrian areas).
 * Applies to BOTH the live DB and prisma/seed-data/stones.json so a
 * re-seed keeps the corrections.
 * Run: npx tsx prisma/fix-content.ts
 */
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SLIP_RE = /^(SRV Dry \d+, Wet (\d+)) \(honed\)$/;

function fixSlip(slip: string | null): string | null {
  if (!slip) return null;
  const m = slip.match(SLIP_RE);
  if (!m) return null;
  const wet = parseInt(m[2], 10);
  if (wet > 15) return null; // genuinely honed values — leave alone
  return `${m[1]} (polished)`;
}

async function main() {
  // --- live DB ---
  const stones = await prisma.stone.findMany({ select: { id: true, slip: true } });
  let dbFixed = 0;
  for (const s of stones) {
    const fixed = fixSlip(s.slip);
    if (fixed) {
      await prisma.stone.update({ where: { id: s.id }, data: { slip: fixed } });
      dbFixed++;
    }
  }
  console.log(`DB slip labels corrected: ${dbFixed}`);

  // --- seed data (so re-seeding keeps the fix) ---
  const seedPath = join(import.meta.dirname, "seed-data", "stones.json");
  const raw = readFileSync(seedPath, "utf8").replace(/^﻿/, "");
  const seed = JSON.parse(raw) as { slip?: string }[];
  let seedFixed = 0;
  for (const s of seed) {
    const fixed = fixSlip(s.slip ?? null);
    if (fixed) {
      s.slip = fixed;
      seedFixed++;
    }
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 4) + "\n");
  console.log(`Seed slip labels corrected: ${seedFixed}`);
}

main().finally(() => prisma.$disconnect());
