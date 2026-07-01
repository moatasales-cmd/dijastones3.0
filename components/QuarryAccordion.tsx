"use client";

import { useState } from "react";

export interface QuarryCountry {
  name: string;
  typeBadges: string[];
  varieties: number;
  geology: string;
  extraction: string;
  blocks: string;
  districts: string;
  ports: string;
  note: string;
  varietiesFromLabel: string;
  stoneNames: string[];
}

export interface QuarryLabels {
  geology: string;
  extraction: string;
  blocks: string;
  districts: string;
  ports: string;
  noteLabel: string;
  varieties: string;
}

export default function QuarryAccordion({
  countries,
  labels: L,
}: {
  countries: QuarryCountry[];
  labels: QuarryLabels;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="quarry-country-grid reveal-stagger">
      {countries.map((qc, i) => (
        <div
          key={qc.name}
          className={`quarry-country-card${open === i ? " open" : ""}`}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="qry-card-header">
            <div className="qry-card-title">
              <h3>{qc.name}</h3>
              <div className="qry-type-badges">
                {qc.typeBadges.map((b) => (
                  <span className="qry-type-badge" key={b}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="qry-card-meta">
              <span className="qry-count">
                {qc.varieties} {L.varieties}
              </span>
              <i className="fa-solid fa-chevron-down qry-chevron" />
            </div>
          </div>
          <div className="qry-card-body">
            <div className="qry-detail-grid">
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.geology}</span>
                <p>{qc.geology}</p>
              </div>
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.extraction}</span>
                <p>{qc.extraction}</p>
              </div>
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.blocks}</span>
                <p>{qc.blocks}</p>
              </div>
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.districts}</span>
                <p>{qc.districts}</p>
              </div>
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.ports}</span>
                <p>{qc.ports}</p>
              </div>
              <div className="qry-detail-section">
                <span className="qry-detail-label">{L.noteLabel}</span>
                <p>
                  <em>{qc.note}</em>
                </p>
              </div>
            </div>
            {qc.stoneNames.length > 0 && (
              <div className="qry-stone-index">
                <span className="qry-detail-label">{qc.varietiesFromLabel}</span>
                <div className="qry-stone-pills">
                  {qc.stoneNames.map((sn) => (
                    <span className="qry-stone-pill" key={sn}>
                      {sn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
