"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

export interface PostData {
  id: string;
  t?: string | null;
  tFr?: string | null;
  c?: string | null;
  cFr?: string | null;
  a?: string | null;
  dt?: string | null;
  r?: string | null;
  e?: string | null;
  eFr?: string | null;
  img?: string | null;
  b?: unknown;
  bFr?: unknown;
}

const input = "w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600";
const lbl = "block text-xs font-medium text-zinc-500 mb-1";

const joinParas = (v: unknown) => (Array.isArray(v) ? (v as string[]).join("\n\n") : "");

export default function PostEditor({ post, isNew }: { post: PostData; isNew: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const v = (x: string | null | undefined) => x ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: Record<string, unknown> = Object.fromEntries(new FormData(e.currentTarget).entries());
    payload.id = post.id || payload.id;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    setBusy(false);
    if (res.ok) {
      setMsg({ text: "Saved.", ok: true });
      if (isNew) setTimeout(() => (window.location.href = `/admin/posts/${res.id}`), 500);
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
        <label className="block col-span-2"><span className={lbl}>Title (EN)</span><input name="t" defaultValue={v(post.t)} className={input} /></label>
        <label className="block col-span-2"><span className={lbl}>Title (FR)</span><input name="tFr" defaultValue={v(post.tFr)} className={input} /></label>
        <label className="block"><span className={lbl}>Category</span><input name="c" defaultValue={v(post.c)} className={input} /></label>
        <label className="block"><span className={lbl}>Author</span><input name="a" defaultValue={v(post.a)} className={input} /></label>
        <label className="block"><span className={lbl}>Date</span><input name="dt" defaultValue={v(post.dt)} className={input} /></label>
        <label className="block"><span className={lbl}>Read time</span><input name="r" defaultValue={v(post.r)} className={input} /></label>
        <div className="col-span-2">
          <span className={lbl}>Cover image</span>
          <ImageUploader name="img" initial={post.img} />
        </div>
        <label className="block col-span-2"><span className={lbl}>Excerpt (EN)</span><textarea name="e" defaultValue={v(post.e)} rows={2} className={input} /></label>
        <label className="block col-span-2"><span className={lbl}>Excerpt (FR)</span><textarea name="eFr" defaultValue={v(post.eFr)} rows={2} className={input} /></label>
      </div>
      <div className="bg-white rounded-lg border border-zinc-200 p-5 mb-5">
        <label className="block mb-4"><span className={lbl}>Body EN (paragraphs separated by a blank line)</span><textarea name="b" defaultValue={joinParas(post.b)} rows={10} className={input} /></label>
        <label className="block"><span className={lbl}>Body FR (paragraphs separated by a blank line)</span><textarea name="bFr" defaultValue={joinParas(post.bFr)} rows={10} className={input} /></label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="bg-zinc-900 text-white text-sm px-5 py-2.5 rounded hover:bg-zinc-800 disabled:opacity-60">
          {busy ? "Saving…" : isNew ? "Create post" : "Save changes"}
        </button>
        {msg && <span className={msg.ok ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg.text}</span>}
      </div>
    </form>
  );
}
