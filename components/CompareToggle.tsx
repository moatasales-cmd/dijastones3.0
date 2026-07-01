"use client";

import { useEffect, useState } from "react";
import { readCompare, toggleCompare, MAX_COMPARE } from "@/lib/compare";

/** Small compare toggle for grid cards — sits beside the favorite heart. */
export default function CompareToggle({
  stoneId,
  stoneName,
}: {
  stoneId: string;
  stoneName: string;
}) {
  const [active, setActive] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = readCompare();
      setActive(ids.some((e) => e.id === stoneId));
      setFull(ids.length >= MAX_COMPARE && !ids.some((e) => e.id === stoneId));
    };
    sync();
    window.addEventListener("dija-compare-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dija-compare-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [stoneId]);

  return (
    <button
      type="button"
      className={`mat-fav-btn${active ? " fav-active" : ""}`}
      style={{ right: "3.25rem" }}
      disabled={full}
      title={full ? `You can compare up to ${MAX_COMPARE} stones` : "Add to compare"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(stoneId, stoneName);
      }}
    >
      <i className={`fa-solid ${active ? "fa-check" : "fa-code-compare"}`} />
    </button>
  );
}
