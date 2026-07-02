import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

// One-time, idempotent content correction (admin-only):
// slip-resistance labels claiming "(honed)" with wet pendulum values ≤15 are
// relabeled "(polished)" — wet ≤15 is a polished-finish figure; honed marble
// tests ~35–47 wet (cf. the catalogue glossary: SRV ≥36 pedestrian).
// Applies to the live DB and prisma/seed-data/stones.json so re-seeds keep it.
const SLIP_RE = /^(SRV Dry \d+, Wet (\d+)) \(honed\)$/;

function fixSlip(slip: string | null | undefined): string | null {
  if (!slip) return null;
  const m = slip.match(SLIP_RE);
  if (!m) return null;
  if (parseInt(m[2], 10) > 15) return null; // genuinely honed — leave alone
  return `${m[1]} (polished)`;
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const stones = await prisma.stone.findMany({ select: { id: true, slip: true } });
  let dbFixed = 0;
  for (const s of stones) {
    const fixed = fixSlip(s.slip);
    if (fixed) {
      await prisma.stone.update({ where: { id: s.id }, data: { slip: fixed } });
      dbFixed++;
    }
  }

  let seedFixed = 0;
  try {
    const seedPath = join(process.cwd(), "prisma", "seed-data", "stones.json");
    const raw = readFileSync(seedPath, "utf8").replace(/^﻿/, "");
    const seed = JSON.parse(raw) as { slip?: string }[];
    for (const s of seed) {
      const fixed = fixSlip(s.slip);
      if (fixed) {
        s.slip = fixed;
        seedFixed++;
      }
    }
    if (seedFixed) writeFileSync(seedPath, JSON.stringify(seed, null, 4) + "\n");
  } catch {
    // seed file not present in some deploys — DB fix alone is fine
  }

  return NextResponse.json({ ok: true, dbFixed, seedFixed });
}
