import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

const STRING_FIELDS = ["title", "architect", "location", "year", "area", "sourceUrl", "articleId"] as const;

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
  if (Array.isArray(body.materials)) data.materials = body.materials;

  const existing = await prisma.caseStudy.findUnique({ where: { id } });
  if (existing) {
    await prisma.caseStudy.update({ where: { id }, data });
  } else {
    if (!data.title) return NextResponse.json({ ok: false, error: "Title required" }, { status: 400 });
    if (!data.sourceUrl) return NextResponse.json({ ok: false, error: "Source URL required" }, { status: 400 });
    await prisma.caseStudy.create({ data: { id, title: String(data.title), sourceUrl: String(data.sourceUrl), ...data } });
  }
  return NextResponse.json({ ok: true, id });
}
