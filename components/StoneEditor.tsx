"use client";

import { useState } from "react";
import GalleryUploader from "@/components/admin/GalleryUploader";

export interface StoneData {
  id: string;
  n?: string | null;
  c?: string | null;
  r?: string | null;
  ci?: string | null;
  ty?: string | null;
  to?: string | null;
  cn?: string | null;
  d?: string | null;
  no?: string | null;
  p?: number | null;
  pPremium?: number | null;
  sizes?: string | null;
  thicknesses?: string | null;
  finishes?: string | null;
  applications?: string | null;
  absorption?: string | null;
  density?: string | null;
  strength?: string | null;
  slip?: string | null;
  age?: string | null;
  dm?: boolean | null;
  g?: unknown;
}

const input = "w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600";
const lbl = "block text-xs font-medium text-zinc-500 mb-1";

function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string; type?: string }) {
  return (
    <label className="block">
      <span className={lbl}>{label}</span>
      <input name={name} defaultValue={value} type={type} className={input} />
    </label>
  );
}

export default function StoneEditor({ stone, isNew }: { stone: StoneData; isNew: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.id = stone.id || payload.id;
    payload.dm = fd.has("dm");
    if (!isNew) payload._existing = true;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/stones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    setBusy(false);
    if (res.ok) {
      setMsg({ text: "Saved.", ok: true });
      if (isNew) setTimeout(() => (window.location.href = `/admin/stones/${res.id}`), 500);
    } else {
      setMsg({ text: res.error || "Save failed", ok: false });
    }
  }

  const v = (x: string | number | null | undefined) => (x == null ? "" : String(x));

  return (
    <form onSubmit={onSubmit} className="max-w-3xl">
      {isNew && (
        <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
          <Field name="id" label="ID (slug, e.g. calacatta-oro)" value={stone.id} />
        </div>
      )}

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
        <span className={lbl}>Gallery images</span>
        <GalleryUploader name="g" initial={Array.isArray(stone.g) ? (stone.g as string[]) : []} />
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5 grid grid-cols-2 gap-4">
        <Field name="n" label="Name" value={v(stone.n)} />
        <Field name="ty" label="Type (Marble, Granite…)" value={v(stone.ty)} />
        <Field name="c" label="Country" value={v(stone.c)} />
        <Field name="r" label="Region" value={v(stone.r)} />
        <Field name="ci" label="City / quarry" value={v(stone.ci)} />
        <Field name="to" label="Tone (white, black…)" value={v(stone.to)} />
        <Field name="cn" label="Colour name" value={v(stone.cn)} />
        <label className="flex items-center gap-2 mt-1">
          <input type="checkbox" name="dm" defaultChecked={!!stone.dm} className="w-4 h-4 accent-amber-700" />
          <span className="text-sm text-zinc-700">Dolomitic marble (shows a badge on the site &amp; PDFs)</span>
        </label>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5 grid grid-cols-2 gap-4">
        <Field name="p" label="Base price /m²" value={v(stone.p)} type="number" />
        <Field name="pPremium" label="Premium price /m²" value={v(stone.pPremium)} type="number" />
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
        <label className="block mb-4">
          <span className={lbl}>Description</span>
          <textarea name="d" defaultValue={v(stone.d)} rows={3} className={input} />
        </label>
        <label className="block">
          <span className={lbl}>Pull-quote / note</span>
          <textarea name="no" defaultValue={v(stone.no)} rows={2} className={input} />
        </label>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5 grid grid-cols-2 gap-4">
        <Field name="sizes" label="Sizes" value={v(stone.sizes)} />
        <Field name="thicknesses" label="Thicknesses" value={v(stone.thicknesses)} />
        <Field name="finishes" label="Finishes" value={v(stone.finishes)} />
        <Field name="applications" label="Applications" value={v(stone.applications)} />
        <Field name="absorption" label="Water absorption" value={v(stone.absorption)} />
        <Field name="density" label="Density" value={v(stone.density)} />
        <Field name="strength" label="Compressive strength" value={v(stone.strength)} />
        <Field name="slip" label="Slip resistance" value={v(stone.slip)} />
        <Field name="age" label="Geological age" value={v(stone.age)} />
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="bg-zinc-900 text-white text-sm px-5 py-2.5 rounded hover:bg-zinc-800 disabled:opacity-60">
          {busy ? "Saving…" : isNew ? "Create stone" : "Save changes"}
        </button>
        {msg && <span className={msg.ok ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg.text}</span>}
      </div>
    </form>
  );
}
