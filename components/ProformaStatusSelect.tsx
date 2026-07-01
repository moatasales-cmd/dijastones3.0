"use client";

import { useState } from "react";

const STATUSES = ["draft", "sent", "accepted", "declined", "expired"];

const COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700",
};

export default function ProformaStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string | null;
}) {
  const [value, setValue] = useState(status || "draft");
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    setBusy(true);
    setValue(next);
    const res = await fetch(`/api/admin/proformas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).then((r) => r.json());
    setBusy(false);
    if (!res.ok) setValue(status || "draft");
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${COLORS[value] ?? COLORS.draft}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
