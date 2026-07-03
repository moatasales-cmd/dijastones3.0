"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteStoneButton from "@/components/DeleteStoneButton";

export interface StoneRow {
  id: string;
  n: string;
  c: string | null;
  ty: string | null;
  p: number | null;
  thumb: string | null;
}

const th = "text-left font-medium text-zinc-500 px-4 py-2.5";
const td = "px-4 py-2.5";

export default function StonesTable({ stones }: { stones: StoneRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return stones;
    return stones.filter((s) =>
      [s.n, s.c, s.ty].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [stones, q]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, type, or country…"
          className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}></th>
              <th className={th}>Name</th>
              <th className={th}>Type</th>
              <th className={th}>Country</th>
              <th className={th}>Price /m²</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td}>
                  <div className="w-10 h-10 rounded-md bg-zinc-100 overflow-hidden flex items-center justify-center">
                    {s.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-regular fa-image text-zinc-300" />
                    )}
                  </div>
                </td>
                <td className={td + " font-medium text-zinc-900"}>{s.n}</td>
                <td className={td}>{s.ty}</td>
                <td className={td}>{s.c}</td>
                <td className={td}>{s.p != null ? `$${s.p}` : "—"}</td>
                <td className={td + " text-right whitespace-nowrap"}>
                  <span className="inline-flex items-center justify-end gap-3">
                    <Link href={`/admin/stones/${s.id}`} className="text-amber-700 hover:underline font-medium">
                      Edit
                    </Link>
                    <DeleteStoneButton stoneId={s.id} stoneName={s.n} />
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                  No stones match &quot;{q}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
