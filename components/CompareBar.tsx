"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readCompare, removeCompare, clearCompare, type CompareEntry } from "@/lib/compare";

export default function CompareBar() {
  const [list, setList] = useState<CompareEntry[]>([]);

  useEffect(() => {
    const sync = () => setList(readCompare());
    sync();
    window.addEventListener("dija-compare-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dija-compare-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div
      className="trade-floating-btn visible"
      style={{
        left: "2rem",
        right: "auto",
        bottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
        maxWidth: "min(90vw, 480px)",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "8px",
        padding: "0.6rem 0.9rem",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      }}
    >
      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
        {list.map((e) => (
          <span key={e.id} style={{ marginRight: 6 }}>
            {e.n}{" "}
            <button
              type="button"
              onClick={() => removeCompare(e.id)}
              aria-label={`Remove ${e.n}`}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", opacity: 0.6 }}
            >
              &times;
            </button>
          </span>
        ))}
      </span>
      <Link href={`/compare?ids=${list.map((e) => e.id).join(",")}`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
        <i className="fa-solid fa-code-compare" /> Compare ({list.length})
      </Link>
      <button
        type="button"
        onClick={clearCompare}
        className="pf-btn pf-btn-ghost pf-btn-sm"
        style={{ whiteSpace: "nowrap" }}
      >
        Clear
      </button>
    </div>
  );
}
