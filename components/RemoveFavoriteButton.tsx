"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Explicit "remove" action for a favorite on the dashboard — updates the
 *  account, mirrors localStorage, and refreshes the server-rendered list. */
export default function RemoveFavoriteButton({
  stoneId,
  label,
}: {
  stoneId: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: stoneId }),
      });
      try {
        const local: string[] = JSON.parse(localStorage.getItem("dija_favorites") || "[]");
        localStorage.setItem("dija_favorites", JSON.stringify(local.filter((id) => id !== stoneId)));
        window.dispatchEvent(new Event("dija-fav-change"));
      } catch {}
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="dash-fav-remove"
      onClick={remove}
      disabled={busy}
      style={{
        width: "100%",
        marginTop: "0.4rem",
        padding: "0.45rem 0.75rem",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: 4,
        color: "var(--text-light)",
        fontSize: "0.75rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      <i className="fa-regular fa-trash-can" /> {busy ? "…" : label}
    </button>
  );
}
