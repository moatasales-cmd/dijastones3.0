"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteCaseStudyButton from "@/components/DeleteCaseStudyButton";

export interface CaseStudyRow {
  id: string;
  title: string;
  architect: string | null;
  location: string | null;
  year: string | null;
  articleId: string | null;
}

const th = "text-left font-medium text-zinc-500 px-4 py-2.5";
const td = "px-4 py-2.5";

export default function CaseStudiesTable({ cases }: { cases: CaseStudyRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cases;
    return cases.filter((c) =>
      [c.title, c.architect, c.location].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [cases, q]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, architect, or location…"
          className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}>Title</th>
              <th className={th}>Architect</th>
              <th className={th}>Location</th>
              <th className={th}>Year</th>
              <th className={th}>Article</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td + " font-medium text-zinc-900"}>{c.title}</td>
                <td className={td}>{c.architect}</td>
                <td className={td}>{c.location}</td>
                <td className={td}>{c.year}</td>
                <td className={td}>
                  {c.articleId ? (
                    <Link href={`/admin/posts/${c.articleId}`} className="text-amber-700 hover:underline">
                      <i className="fa-solid fa-newspaper" />
                    </Link>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className={td + " text-right whitespace-nowrap"}>
                  <span className="inline-flex items-center justify-end gap-3">
                    <Link href={`/admin/case-studies/${c.id}`} className="text-amber-700 hover:underline font-medium">
                      Edit
                    </Link>
                    <DeleteCaseStudyButton caseStudyId={c.id} title={c.title} />
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                  No case studies match &quot;{q}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
