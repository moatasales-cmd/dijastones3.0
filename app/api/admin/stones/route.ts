import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

const STRING_FIELDS = [
  "n", "c", "r", "ci", "ty", "to", "cn", "d", "no",
  "sizes", "thicknesses", "finishes", "applications",
  "absorption", "density", "strength", "slip", "age",
] as const;
const NUMBER_FIELDS = ["p", "pPremium"] as const;

function buildData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const f of STRING_FIELDS) {
    if (typeof body[f] === "string") data[f] = (body[f] as string).trim() || null;
  }
  for (const f of NUMBER_FIELDS) {
    if (body[f] !== undefined && body[f] !== "") {
      const n = Number(body[f]);
      data[f] = Number.isFinite(n) ? Math.round(n) : null;
    }
  }
  return data;
}

// Create or update a stone (upsert by id).
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

  const data = buildData(body);
  if (!data.n && !body._existing) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.stone.findUnique({ where: { id } });
  if (existing) {
    await prisma.stone.update({ where: { id }, data });
  } else {
    await prisma.stone.create({
      data: { id, n: String(data.n ?? id), c: String(data.c ?? ""), ...data },
    });
  }
  return NextResponse.json({ ok: true, id });
}
