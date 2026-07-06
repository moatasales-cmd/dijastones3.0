"use client";

import { useState } from "react";

export interface MaterialMatch {
  application: string;
  rawStone: string;
  stoneId: string | null;
  stoneName: string | null;
  matchType: "exact" | "similar" | "suggested" | "none";
}

export interface CaseStudyData {
  id: string;
  title?: string | null;
  architect?: string | null;
  location?: string | null;
  year?: string | null;
  area?: string | null;
  sourceUrl?: string | null;
  articleId?: string | null;
  materials?: unknown;
}

export interface StoneOption {
  id: string;
  n: string;
}

const input = "w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600";
const lbl = "block text-xs font-medium text-zinc-500 mb-1";

function parseMaterials(v: unknown): MaterialMatch[] {
  return Array.isArray(v) ? (v as MaterialMatch[]) : [];
}

export default function CaseStudyEditor({
  caseStudy,
  isNew,
  stones,
}: {
  caseStudy: CaseStudyData;
  isNew: boolean;
  stones: StoneOption[];
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [materials, setMaterials] = useState<MaterialMatch[]>(parseMaterials(caseStudy.materials));
  const v = (x: string | null | undefined) => x ?? "";

  function updateRow(i: number, patch: Partial<MaterialMatch>) {
    setMaterials((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setMaterials((rows) => [...rows, { application: "", rawStone: "", stoneId: null, stoneName: null, matchType: "similar" }]);
  }
  function removeRow(i: number) {
    setMaterials((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      id: caseStudy.id || form.id,
      title: form.title,
      architect: form.architect,
      location: form.location,
      year: form.year,
      area: form.area,
      sourceUrl: form.sourceUrl,
      articleId: form.articleId,
      materials: materials
        .filter((m) => m.stoneId || m.rawStone)
        .map((m) => ({
          ...m,
          stoneName: stones.find((s) => s.id === m.stoneId)?.n ?? m.stoneName ?? null,
        })),
    };
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    setBusy(false);
    if (res.ok) {
      setMsg({ text: "Saved.", ok: true });
      if (isNew) setTimeout(() => (window.location.href = `/admin/case-studies/${res.id}`), 500);
    } else setMsg({ text: res.error || "Save failed", ok: false });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl">
      {isNew && (
        <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
          <label className="block"><span className={lbl}>ID (slug)</span><input name="id" className={input} /></label>
        </div>
      )}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5 grid grid-cols-2 gap-4">
        <label className="block col-span-2"><span className={lbl}>Title</span><input name="title" defaultValue={v(caseStudy.title)} className={input} /></label>
        <label className="block"><span className={lbl}>Architect</span><input name="architect" defaultValue={v(caseStudy.architect)} className={input} /></label>
        <label className="block"><span className={lbl}>Location</span><input name="location" defaultValue={v(caseStudy.location)} className={input} /></label>
        <label className="block"><span className={lbl}>Year</span><input name="year" defaultValue={v(caseStudy.year)} className={input} /></label>
        <label className="block"><span className={lbl}>Area</span><input name="area" defaultValue={v(caseStudy.area)} className={input} /></label>
        <label className="block col-span-2"><span className={lbl}>Source URL</span><input name="sourceUrl" defaultValue={v(caseStudy.sourceUrl)} className={input} /></label>
        <label className="block col-span-2">
          <span className={lbl}>Linked Journal article ID (optional)</span>
          <input name="articleId" defaultValue={v(caseStudy.articleId)} className={input} placeholder="e.g. story-abc-office" />
        </label>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className={lbl + " mb-0"}>Matched materials</span>
          <button type="button" onClick={addRow} className="text-amber-700 text-sm font-medium hover:underline">
            <i className="fa-solid fa-plus" /> Add row
          </button>
        </div>
        {materials.length === 0 && <p className="text-sm text-zinc-400 mb-3">No materials yet.</p>}
        <div className="space-y-3">
          {materials.map((m, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center border border-zinc-100 rounded p-2">
              <input
                className={input + " col-span-3"}
                placeholder="Application (e.g. FLOOR COVERINGS)"
                value={m.application}
                onChange={(e) => updateRow(i, { application: e.target.value })}
              />
              <input
                className={input + " col-span-3"}
                placeholder="Raw stone as documented"
                value={m.rawStone}
                onChange={(e) => updateRow(i, { rawStone: e.target.value })}
              />
              <select
                className={input + " col-span-3"}
                value={m.stoneId ?? ""}
                onChange={(e) => updateRow(i, { stoneId: e.target.value || null })}
              >
                <option value="">— DIJA stone —</option>
                {stones.map((s) => (
                  <option key={s.id} value={s.id}>{s.n}</option>
                ))}
              </select>
              <select
                className={input + " col-span-2"}
                value={m.matchType}
                onChange={(e) => updateRow(i, { matchType: e.target.value as MaterialMatch["matchType"] })}
              >
                <option value="exact">Exact</option>
                <option value="similar">Similar</option>
                <option value="suggested">Suggested</option>
                <option value="none">None</option>
              </select>
              <button type="button" onClick={() => removeRow(i)} className="col-span-1 text-red-500 hover:text-red-700">
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="bg-zinc-900 text-white text-sm px-5 py-2.5 rounded hover:bg-zinc-800 disabled:opacity-60">
          {busy ? "Saving…" : isNew ? "Create case study" : "Save changes"}
        </button>
        {msg && <span className={msg.ok ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg.text}</span>}
      </div>
    </form>
  );
}
