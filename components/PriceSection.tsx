"use client";

import Link from "next/link";
import { useState } from "react";
import { SQM_TO_SQF } from "./MaterialCard";

function money(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface PriceLabels {
  pricing: string;
  standardGrade: string;
  premiumGrade: string;
  priceNote: string;
  contactUs: string;
  priceNote2: string;
}

export default function PriceSection({
  p,
  pPremium,
  labels: L,
}: {
  p: number;
  pPremium: number | null;
  labels: PriceLabels;
}) {
  const [unit, setUnit] = useState<"sqm" | "sqf">("sqm");
  const factor = unit === "sqf" ? SQM_TO_SQF : 1;
  const unitLabel = unit === "sqf" ? "/ft²" : "/m²";
  const hasPremium = !!pPremium && pPremium > p;

  return (
    <div className="mat-price-section">
      <h3>
        <i className="fa-solid fa-tag" /> {L.pricing}
      </h3>
      <div className="mat-price-grid">
        <div className="mat-price-row">
          <span className="mat-price-label">{L.standardGrade}</span>
          <span className="mat-price-amount">
            <span className="mat-price-val">${money(p / factor)}</span>
            <span className="mat-price-unit">{unitLabel}</span>
          </span>
        </div>
        {hasPremium && (
          <div className="mat-price-row">
            <span className="mat-price-label">{L.premiumGrade}</span>
            <span className="mat-price-amount">
              <span className="mat-price-val">${money(pPremium! / factor)}</span>
              <span className="mat-price-unit">{unitLabel}</span>
            </span>
          </div>
        )}
      </div>
      <div className="mat-unit-toggle mat-unit-toggle-inline">
        <button
          type="button"
          className={`mat-unit-btn${unit === "sqm" ? " active" : ""}`}
          onClick={() => setUnit("sqm")}
        >
          m²
        </button>
        <button
          type="button"
          className={`mat-unit-btn${unit === "sqf" ? " active" : ""}`}
          onClick={() => setUnit("sqf")}
        >
          ft²
        </button>
      </div>
      <p className="mat-price-note">
        {L.priceNote} <Link href="/contact">{L.contactUs}</Link> {L.priceNote2}
      </p>
    </div>
  );
}
