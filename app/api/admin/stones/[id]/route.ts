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

  const existing = await prisma.stone.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Clean up references first (favorites have no FK to Stone).
  await prisma.favorite.deleteMany({ where: { stoneId: id } });
  await prisma.stone.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
