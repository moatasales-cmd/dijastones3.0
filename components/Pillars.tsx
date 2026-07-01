"use client";

import { useState } from "react";

export interface Pillar {
  icon: string;
  title: string;
  text: string;
  target: string;
}

export default function Pillars({
  pillars,
  targetLabel,
}: {
  pillars: Pillar[];
  targetLabel: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="pillar-grid reveal-stagger">
      {pillars.map((p, i) => (
        <div
          key={p.title}
          className={`pillar-card${open === i ? " open" : ""}`}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="pillar-header">
            <div className="pillar-icon">
              <i className={p.icon} />
            </div>
            <h3>{p.title}</h3>
            <i className="fa-solid fa-chevron-down pillar-chevron" />
          </div>
          <div className="pillar-content">
            <p>{p.text}</p>
            <p>
              <strong>{targetLabel}:</strong> {p.target}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
