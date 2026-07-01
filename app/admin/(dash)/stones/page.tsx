import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Stones — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2";
const td = "px-4 py-2";

export default async function AdminStones() {
  const stones = await prisma.stone.findMany({
    orderBy: { n: "asc" },
    select: { id: true, n: true, c: true, ty: true, p: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Stones ({stones.length})</h1>
        <Link href="/admin/stones/new" className="bg-zinc-900 text-white text-sm px-4 py-2 rounded hover:bg-zinc-800">
          <i className="fa-solid fa-plus" /> New stone
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}>Name</th>
              <th className={th}>Type</th>
              <th className={th}>Country</th>
              <th className={th}>Price /m²</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {stones.map((s) => (
              <tr key={s.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className={td + " font-medium"}>{s.n}</td>
                <td className={td}>{s.ty}</td>
                <td className={td}>{s.c}</td>
                <td className={td}>{s.p != null ? `$${s.p}` : "—"}</td>
                <td className={td + " text-right"}>
                  <Link href={`/admin/stones/${s.id}`} className="text-amber-700 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
