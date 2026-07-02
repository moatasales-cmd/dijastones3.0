"use client";

import { useMemo, useState } from "react";
import {
  INCOTERMS,
  PAYMENT_TERMS,
  THICKNESSES,
  FINISHES,
  GRADES,
  DESTINATION_COUNTRIES,
  SHIPPING_DISCLAIMER,
  SQM_TO_SQF,
  unitPrice,
  lineTotal,
  computeTotals,
  zoneForCountry,
  type LineItem,
} from "@/lib/proforma";

export interface Priced {
  id: string;
  n: string;
  p: number;
}
export interface ClientPrefill {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface Row {
  stoneId: string;
  thickness: string;
  finish: string;
  grade: string;
  area: string; // as typed (in the selected unit)
}

const money = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyRow = (): Row => ({
  stoneId: "",
  thickness: "2 cm",
  finish: "Polished",
  grade: "Standard",
  area: "",
});

export default function ProformaBuilder({
  stones,
  client,
}: {
  stones: Priced[];
  client: ClientPrefill;
}) {
  const stoneMap = useMemo(() => new Map(stones.map((s) => [s.id, s])), [stones]);

  const [c, setC] = useState<ClientPrefill>(client);
  const [unit, setUnit] = useState<"sqm" | "sqf">("sqm");
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [country, setCountry] = useState("");
  const [incoterm, setIncoterm] = useState("FOB");
  const [paymentTerm, setPaymentTerm] = useState("T/T");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Convert typed area to m² for the engine.
  const toM2 = (area: string) => {
    const n = parseFloat(area) || 0;
    return unit === "sqf" ? n / SQM_TO_SQF : n;
  };

  const items: LineItem[] = rows
    .filter((r) => r.stoneId && parseFloat(r.area) > 0)
    .map((r) => {
      const s = stoneMap.get(r.stoneId)!;
      return {
        stoneId: r.stoneId,
        stoneName: s.n,
        basePrice: s.p,
        thickness: r.thickness,
        finish: r.finish,
        grade: r.grade,
        area: toM2(r.area),
      };
    });

  const totals = computeTotals(items, country, incoterm);
  const zone = country ? zoneForCountry(country) : null;
  const unitLabel = unit === "sqf" ? "/ft²" : "/m²";
  const priceInUnit = (perM2: number) => (unit === "sqf" ? perM2 / SQM_TO_SQF : perM2);

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  async function save() {
    setError("");
    if (!c.name || !c.email) return setError("Client name and email are required.");
    if (items.length === 0) return setError("Add at least one stone item.");
    if (!country) return setError("Select a destination country.");
    setBusy(true);
    try {
      const payload = {
        unitSystem: unit,
        client: c,
        destinationCountry: country,
        incoterm,
        paymentTerm,
        items: items.map((it) => ({
          ...it,
          unitPrice: unitPrice(it),
          lineTotal: lineTotal(it),
        })),
        ...totals,
      };
      const res = await fetch("/api/proforma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) window.location.href = `/proforma/${json.id}`;
      else setError(json.error || "Could not save.");
    } catch {
      setError("Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pf-form">
      {/* Client */}
      <div className="pf-section">
        <h2>
          <i className="fa-solid fa-building" /> Client details
        </h2>
        <div className="pf-grid-2">
          <input className="pf-input" placeholder="Client name *" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <input className="pf-input" placeholder="Email *" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
          <input className="pf-input" placeholder="Company" value={c.company} onChange={(e) => setC({ ...c, company: e.target.value })} />
          <input className="pf-input" placeholder="Phone" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          <input className="pf-input" placeholder="City" value={c.city} onChange={(e) => setC({ ...c, city: e.target.value })} />
          <input className="pf-input" placeholder="Country" value={c.country} onChange={(e) => setC({ ...c, country: e.target.value })} />
        </div>
        <div className="pf-unit-toggle" style={{ marginTop: "1rem" }}>
          {(["sqm", "sqf"] as const).map((u) => (
            <label className="pf-unit-opt" key={u}>
              <input type="radio" name="unit" checked={unit === u} onChange={() => setUnit(u)} />{" "}
              <span>{u === "sqm" ? "Square meters (m²)" : "Square feet (ft²)"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="pf-section">
        <h2>
          <i className="fa-solid fa-cube" /> Stone items
        </h2>
        <div className="pf-items-table">
          {rows.map((r, i) => {
            const s = r.stoneId ? stoneMap.get(r.stoneId) : null;
            const up = s ? unitPrice({ basePrice: s.p, thickness: r.thickness, finish: r.finish, grade: r.grade }) : 0;
            const lt = s && parseFloat(r.area) > 0 ? up * toM2(r.area) : 0;
            return (
              <div className="pf-item-row" key={i}>
                <div>
                  <label className="pf-item-field-label">Stone</label>
                  <select className="pf-input" value={r.stoneId} onChange={(e) => setRow(i, { stoneId: e.target.value })}>
                    <option value="">Select stone…</option>
                    {stones.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pf-item-field-label">Thickness</label>
                  <select className="pf-input" value={r.thickness} onChange={(e) => setRow(i, { thickness: e.target.value })}>
                    {THICKNESSES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="pf-item-field-label">Finish</label>
                  <select className="pf-input" value={r.finish} onChange={(e) => setRow(i, { finish: e.target.value })}>
                    {FINISHES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="pf-item-field-label">Grade</label>
                  <select className="pf-input" value={r.grade} onChange={(e) => setRow(i, { grade: e.target.value })}>
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="pf-item-field-label">Area ({unit === "sqf" ? "ft²" : "m²"})</label>
                  <input className="pf-input" type="number" min="0" step="any" placeholder={`Area ${unit === "sqf" ? "ft²" : "m²"}`} value={r.area} onChange={(e) => setRow(i, { area: e.target.value })} />
                </div>
                <div className="pf-item-total-row" style={{ whiteSpace: "nowrap", textAlign: "right", minWidth: 90 }}>
                  {lt ? money(lt) : <span style={{ opacity: 0.5 }}>—</span>}
                  {rows.length > 1 && (
                    <button type="button" className="pf-btn pf-btn-ghost pf-btn-sm" style={{ marginLeft: 8 }} onClick={() => removeRow(i)} aria-label="Remove">
                      <i className="fa-solid fa-xmark" /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="pf-add-item" onClick={addRow}>
          <i className="fa-solid fa-plus" /> Add item
        </button>
      </div>

      {/* Shipping */}
      <div className="pf-section">
        <h2>
          <i className="fa-solid fa-ship" /> Shipping & terms
        </h2>
        <div className="pf-grid-2">
          <div>
            <label className="pf-label">Destination country *</label>
            <select className="pf-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select…</option>
              {DESTINATION_COUNTRIES.map((co) => <option key={co}>{co}</option>)}
            </select>
          </div>
          <div>
            <label className="pf-label">Incoterm *</label>
            <select className="pf-input" value={incoterm} onChange={(e) => setIncoterm(e.target.value)}>
              {INCOTERMS.map((it) => (
                <option key={it.code} value={it.code}>
                  {it.code} — {it.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="pf-label">Payment term</label>
            <select className="pf-input" value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)}>
              {PAYMENT_TERMS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {zone && (
          <p className="pf-note" style={{ marginTop: "0.75rem" }}>
            <i className="fa-solid fa-info-circle" /> Zone: <strong>{zone.zone}</strong> · {money(zone.rate_per_container_20ft)}/container · transit {zone.transit_days} days
          </p>
        )}
      </div>

      {/* Totals */}
      <div className="pf-section pf-summary">
        <h2>
          <i className="fa-solid fa-receipt" /> Summary
        </h2>
        <div className="pf-summary-row"><span>Total area</span><span>{totals.totalArea.toLocaleString("en-US", { maximumFractionDigits: 2 })} m²</span></div>
        <div className="pf-summary-row"><span>Goods subtotal</span><span>{money(totals.subtotal)}</span></div>
        <div className="pf-summary-row"><span>Containers (20ft)</span><span>{totals.containers}</span></div>
        <div className="pf-summary-row">
          <span>Freight estimate {totals.sellerFreight ? "(included)" : "(buyer's account)"}</span>
          <span>{money(totals.shippingCost)}</span>
        </div>
        <div className="pf-summary-row pf-summary-total"><span>Grand total ({incoterm})</span><span>{money(totals.grandTotal)}</span></div>
        <p className="pf-disclaimer" style={{ opacity: 0.6, fontSize: "0.8rem", marginTop: "0.75rem" }}>{SHIPPING_DISCLAIMER}</p>

        {error && <div style={{ color: "#c0392b", margin: "0.75rem 0" }}>{error}</div>}
        <button type="button" className="pf-btn pf-btn-primary" disabled={busy} onClick={save} style={{ marginTop: "0.5rem" }}>
          {busy ? "Saving…" : "Create proforma"} <i className="fa-solid fa-file-invoice" />
        </button>
      </div>
    </div>
  );
}
