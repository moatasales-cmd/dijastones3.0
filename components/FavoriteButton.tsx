"use client";

import { useEffect, useState } from "react";

const KEY = "dija_favorites";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Heart toggle backed by localStorage (works for guests, exactly like the old
 * site). Phase 3 will additionally sync to the account API when logged in.
 * A custom event keeps every button for the same stone in sync.
 */
export default function FavoriteButton({
  stoneId,
  title,
  large = false,
}: {
  stoneId: string;
  title: string;
  large?: boolean;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(read().includes(stoneId));
    sync();
    window.addEventListener("dija-fav-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dija-fav-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [stoneId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = read();
    const idx = ids.indexOf(stoneId);
    if (idx === -1) ids.push(stoneId);
    else ids.splice(idx, 1);
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {}
    window.dispatchEvent(new Event("dija-fav-change"));
    // Sync to the account too (no-op / ignored for guests → 401).
    fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stoneId }),
    }).catch(() => {});
  };

  return (
    <button
      type="button"
      className={`mat-fav-btn${large ? " mat-fav-btn-lg" : ""}${fav ? " fav-active" : ""}`}
      data-stone-id={stoneId}
      onClick={toggle}
      title={title}
      aria-pressed={fav}
    >
      <i className={`${fav ? "fa-solid" : "fa-regular"} fa-heart`} />
    </button>
  );
}
