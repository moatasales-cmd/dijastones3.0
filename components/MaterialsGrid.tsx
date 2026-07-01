"use client";

import { useMemo, useState } from "react";
import MaterialCard, { type CardStone, type CardLabels } from "./MaterialCard";

export interface GridStrings extends CardLabels {
  searchPlaceholder: string;
  sortDefault: string;
  sortAz: string;
  sortZa: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortCountry: string;
  allCountries: string;
  allTypes: string;
  allTones: string;
  clearFilters: string;
  showingPrefix: string;
  showingOf: string;
  results: string;
  noResults: string;
  resetFilters: string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function MaterialsGrid({
  stones,
  countries,
  types,
  tones,
  strings: S,
}: {
  stones: CardStone[];
  countries: string[];
  types: string[];
  tones: string[];
  strings: GridStrings;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [tone, setTone] = useState("all");
  const [unit, setUnit] = useState<"sqm" | "sqf">("sqm");

  const visible = useMemo(() => {
    const query = q.toLowerCase().trim();
    let list = stones.filter((s) => {
      if (query) {
        const hay = [s.n, s.ci, s.cn, s.c, s.ty]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (country !== "all" && s.c !== country) return false;
      if (type !== "all" && s.ty !== type) return false;
      if (tone !== "all" && s.to !== tone) return false;
      return true;
    });

    const by = {
      az: (a: CardStone, b: CardStone) => a.n.localeCompare(b.n),
      za: (a: CardStone, b: CardStone) => b.n.localeCompare(a.n),
      "price-asc": (a: CardStone, b: CardStone) => (a.p ?? 0) - (b.p ?? 0),
      "price-desc": (a: CardStone, b: CardStone) => (b.p ?? 0) - (a.p ?? 0),
      country: (a: CardStone, b: CardStone) => a.c.localeCompare(b.c),
    } as const;
    if (sort in by) list = [...list].sort(by[sort as keyof typeof by]);
    return list;
  }, [stones, q, sort, country, type, tone]);

  const clearAll = () => {
    setQ("");
    setSort("default");
    setCountry("all");
    setType("all");
    setTone("all");
  };

  return (
    <>
      <div className="mat-toolbar">
        <div className="mat-search-wrap">
          <i className="fa-solid fa-search mat-search-icon" />
          <input
            type="text"
            className="mat-search"
            placeholder={S.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mat-toolbar-right">
          <select
            className="mat-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">{S.sortDefault}</option>
            <option value="az">{S.sortAz}</option>
            <option value="za">{S.sortZa}</option>
            <option value="price-asc">{S.sortPriceAsc}</option>
            <option value="price-desc">{S.sortPriceDesc}</option>
            <option value="country">{S.sortCountry}</option>
          </select>
          <div className="mat-unit-toggle">
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
        </div>
      </div>

      <div className="mat-filters">
        <select
          className="mat-sort mat-filter"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">{S.allCountries}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="mat-sort mat-filter"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">{S.allTypes}</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="mat-sort mat-filter"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="all">{S.allTones}</option>
          {tones.map((t) => (
            <option key={t} value={t}>
              {cap(t)}
            </option>
          ))}
        </select>
        <button type="button" className="mat-filter-clear" onClick={clearAll}>
          {S.clearFilters}
        </button>
      </div>

      <div className="mat-bar">
        <span className="filter-count">
          {S.showingPrefix} {visible.length} {S.showingOf} {stones.length}{" "}
          {S.results}
        </span>
      </div>

      <div className="grid-4">
        {visible.map((s) => (
          <MaterialCard key={s.id} stone={s} unit={unit} labels={S} />
        ))}
        {visible.length === 0 && (
          <div className="empty-state" style={{ display: "block" }}>
            {S.noResults}{" "}
            <a href="#" onClick={(e) => (e.preventDefault(), clearAll())}>
              {S.resetFilters}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
