import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import StonesTable, { type StoneRow } from "@/components/admin/StonesTable";

export const metadata = { title: "Stones — Admin" };

export default async function AdminStones() {
  const stones = await prisma.stone.findMany({
    orderBy: { n: "asc" },
    select: { id: true, n: true, c: true, ty: true, p: true, g: true },
  });

  const rows: StoneRow[] = stones.map((s) => ({
    id: s.id,
    n: s.n,
    c: s.c,
    ty: s.ty,
    p: s.p,
    thumb: Array.isArray(s.g) && typeof s.g[0] === "string" ? (s.g[0] as string) : null,
  }));

  return (
    <div>
      <PageHeader
        title="Stones"
        count={stones.length}
        actions={
          <Link
            href="/admin/stones/new"
            className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="fa-solid fa-plus" /> New stone
          </Link>
        }
      />
      <StonesTable stones={rows} />
    </div>
  );
}
