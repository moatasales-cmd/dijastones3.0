"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
  if (!res.ok) throw new Error(res.error || "Upload failed");
  return res.path as string;
}

/** Multi-image gallery manager: upload one or more images, reorder, remove,
 * and promote any image to the cover (first) slot. Writes the ordered path
 * array as JSON into a hidden input named `name`. */
export default function GalleryUploader({ name, initial }: { name: string; initial?: string[] | null }) {
  const [images, setImages] = useState<string[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[] | null | undefined) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadFile));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function remove(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function makeCover(i: number) {
    setImages((prev) => {
      if (i === 0) return prev;
      const next = [...prev];
      const [img] = next.splice(i, 1);
      next.unshift(img);
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {images.map((src, i) => (
            <div key={src + i} className="relative group border border-zinc-200 rounded-lg overflow-hidden bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-28 object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-amber-700 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  COVER
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i !== 0 && (
                  <button type="button" title="Make cover" onClick={() => makeCover(i)} className="w-7 h-7 rounded-full bg-white/90 text-zinc-800 text-xs hover:bg-white">
                    <i className="fa-solid fa-star" />
                  </button>
                )}
                <button type="button" title="Move left" onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-full bg-white/90 text-zinc-800 text-xs hover:bg-white disabled:opacity-40">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <button type="button" title="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="w-7 h-7 rounded-full bg-white/90 text-zinc-800 text-xs hover:bg-white disabled:opacity-40">
                  <i className="fa-solid fa-arrow-right" />
                </button>
                <button type="button" title="Remove" onClick={() => remove(i)} className="w-7 h-7 rounded-full bg-white/90 text-red-600 text-xs hover:bg-white">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors text-sm ${
          dragOver ? "border-amber-600 bg-amber-50" : "border-zinc-300 hover:border-zinc-400"
        }`}
      >
        {busy ? (
          <span className="text-amber-700">Uploading…</span>
        ) : (
          <span className="text-zinc-500">
            <i className="fa-solid fa-cloud-arrow-up mr-2 text-zinc-400" />
            <span className="text-amber-700 font-medium">Click to upload</span> or drag images here
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      <p className="text-xs text-zinc-400 mt-1">The first image is used as the cover photo everywhere on the site.</p>
    </div>
  );
}
