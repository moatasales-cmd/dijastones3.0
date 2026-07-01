"use client";

import { useEffect, useState } from "react";
import { readCompare, toggleCompare, MAX_COMPARE } from "@/lib/compare";

export default function CompareButton({
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
      const has = ids.some((e) => e.id === stoneId);
      setActive(has);
      setFull(ids.length >= MAX_COMPARE && !has);
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
      className={`mat-fav-btn-lg${active ? " fav-active" : ""}`}
      style={{ marginLeft: "0.5rem" }}
      disabled={full}
      title={full ? `You can compare up to ${MAX_COMPARE} stones` : "Add to compare"}
      onClick={() => toggleCompare(stoneId, stoneName)}
    >
      <i className={`fa-solid ${active ? "fa-check" : "fa-code-compare"}`} />
    </button>
  );
}
