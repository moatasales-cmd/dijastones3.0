import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

const STRING_FIELDS = ["t", "tFr", "c", "cFr", "a", "dt", "r", "e", "eFr", "img"] as const;

// Split a textarea (blank-line separated) into a paragraph array.
function paragraphs(v: unknown): string[] {
  if (typeof v !== "string") return [];
  return v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const f of STRING_FIELDS) {
    if (typeof body[f] === "string") data[f] = (body[f] as string).trim() || null;
  }
  if (typeof body.b === "string") data.b = paragraphs(body.b);
  if (typeof body.bFr === "string") data.bFr = paragraphs(body.bFr);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (existing) {
    await prisma.post.update({ where: { id }, data });
  } else {
    if (!data.t) return NextResponse.json({ ok: false, error: "Title required" }, { status: 400 });
    await prisma.post.create({ data: { id, t: String(data.t), ...data } });
  }
  return NextResponse.json({ ok: true, id });
}
