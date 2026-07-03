"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
  if (!res.ok) throw new Error(res.error || "Upload failed");
  return res.path as string;
}

/** Single-image picker: shows a preview, drag-and-drop or click to upload,
 * writes the resulting path into a hidden input named `name` so it submits
 * with the surrounding form like any other field. */
export default function ImageUploader({ name, initial }: { name: string; initial?: string | null }) {
  const [value, setValue] = useState(initial || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setValue(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center gap-4 border-2 border-dashed rounded-lg p-3 cursor-pointer transition-colors ${
          dragOver ? "border-amber-600 bg-amber-50" : "border-zinc-300 hover:border-zinc-400"
        }`}
      >
        <div className="w-24 h-24 shrink-0 rounded bg-zinc-100 overflow-hidden flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-regular fa-image text-zinc-300 text-2xl" />
          )}
        </div>
        <div className="text-sm text-zinc-500">
          {busy ? (
            <span className="text-amber-700">Uploading…</span>
          ) : (
            <>
              <span className="text-amber-700 font-medium">Click to upload</span> or drag an image here
              <div className="text-xs text-zinc-400 mt-1">JPG, PNG, WEBP, or GIF · up to 8MB</div>
            </>
          )}
          {error && <div className="text-red-600 mt-1">{error}</div>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
