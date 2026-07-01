"use client";

import Link from "next/link";
import { stoneImg } from "@/lib/img";
import FavoriteButton from "./FavoriteButton";

export const SQM_TO_SQF = 10.7639;

export interface CardStone {
  id: string;
  n: string;
  c: string;
  ci: string | null;
  ty: string | null;
  to: string | null;
  cn: string | null;
  p: number | null;
  pPremium: number | null;
  g: unknown;
}

export interface CardLabels {
  from: string;
  premium: string;
  exworks: string;
  exworksTitle: string;
  addFavorite: string;
}

function money(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MaterialCard({
  stone: s,
  unit,
  labels,
}: {
  stone: CardStone;
  unit: "sqm" | "sqf";
  labels: CardLabels;
}) {
  const img = stoneImg(s);
  const factor = unit === "sqf" ? SQM_TO_SQF : 1;
  const unitLabel = unit === "sqf" ? "/ft²" : "/m²";
  const hasPremium = !!s.pPremium && !!s.p && s.pPremium > s.p;

  return (
    <Link href={`/materials/${s.id}`} className="card-swatch mat-card">
      <div className="card-img">
        {img ? (
          <img src={img} alt={s.n} loading="lazy" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
            }}
          />
        )}
        <span className="card-country">{s.c}</span>
        <FavoriteButton stoneId={s.id} title={labels.addFavorite} />
      </div>
      <div className="card-body">
        <h3>{s.n}</h3>
        <span className="card-origin">
          {s.ci} · {s.ty}
        </span>
        {s.p != null && (
          <span className="mat-price">
            {labels.from}{" "}
            <span className="mat-price-val">${money(s.p / factor)}</span>
            <span className="mat-price-unit">{unitLabel}</span>
            {hasPremium && (
              <>
                {" "}
                · {labels.premium}{" "}
                <span className="mat-premium-val">
                  ${money(s.pPremium! / factor)}
                </span>
                <span className="mat-premium-unit">{unitLabel}</span>
              </>
            )}
            <span className="mat-disc" title={labels.exworksTitle}>
              {labels.exworks}
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
