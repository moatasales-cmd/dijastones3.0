import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.caseStudy.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Its linked Journal article only exists for this case study — remove it too
  // rather than leaving an orphaned "story-*" post behind.
  if (existing.articleId) {
    await prisma.post.delete({ where: { id: existing.articleId } }).catch(() => {});
  }
  await prisma.caseStudy.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
