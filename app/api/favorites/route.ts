import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";

/** List the signed-in client's favorite stone ids. */
export async function GET() {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: true, favorites: [] });
  const favs = await prisma.favorite.findMany({
    where: { clientId: client.id },
    select: { stoneId: true },
  });
  return NextResponse.json({ ok: true, favorites: favs.map((f) => f.stoneId) });
}

/**
 * POST { stoneId } → toggle one favorite.
 * POST { merge: string[] } → add many (used to sync guest favorites on login).
 * Returns the updated list of favorite ids.
 */
export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (Array.isArray(body.merge)) {
    const ids: string[] = (body.merge as unknown[]).filter(
      (v): v is string => typeof v === "string"
    );
    if (ids.length) {
      // SQLite doesn't support skipDuplicates, so insert only the missing ones.
      const existing = await prisma.favorite.findMany({
        where: { clientId: client.id, stoneId: { in: ids } },
        select: { stoneId: true },
      });
      const have = new Set(existing.map((e) => e.stoneId));
      const toAdd = ids.filter((id) => !have.has(id));
      if (toAdd.length) {
        await prisma.favorite.createMany({
          data: toAdd.map((stoneId) => ({ clientId: client.id, stoneId })),
        });
      }
    }
  } else {
    const stoneId = String(body.stoneId ?? "");
    if (!stoneId) {
      return NextResponse.json({ ok: false, error: "stoneId required" }, { status: 400 });
    }
    const existing = await prisma.favorite.findUnique({
      where: { clientId_stoneId: { clientId: client.id, stoneId } },
    });
    if (existing) {
      await prisma.favorite.delete({
        where: { clientId_stoneId: { clientId: client.id, stoneId } },
      });
    } else {
      await prisma.favorite.create({ data: { clientId: client.id, stoneId } });
    }
  }

  const favs = await prisma.favorite.findMany({
    where: { clientId: client.id },
    select: { stoneId: true },
  });
  return NextResponse.json({ ok: true, favorites: favs.map((f) => f.stoneId) });
}
