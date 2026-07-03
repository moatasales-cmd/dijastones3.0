"use client";

import { useMemo, useState } from "react";
import {
  SIZE_CATEGORIES_METRIC,
  SIZE_CATEGORIES_IMPERIAL,
  THICKNESS_MULTIPLIER,
  FINISHES,
  GRADES,
  DESTINATION_COUNTRIES,
  DESTINATION_PORTS,
  INCOTERMS,
  SELECTABLE_INCOTERMS,
  PAYMENT_TERMS,
  SHIPPING_DISCLAIMER,
  SQM_TO_SQF,
  computeItem,
  containersNeeded,
  zoneForCountry,
  estimateIncotermCosts,
  type ProformaItem,
} from "@/lib/proforma-engine";

export interface Priced {
  id: string;
  n: string;
  p: number;
  pPremium: number | null;
  ty: string | null;
  c: string;
  image: string | null;
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

export interface Row {
  stoneId: string;
  grade: string;
  finish: string;
  categoryId: string; // "" = not chosen, "custom", or a category id
  sizeIndex: number | null;
  customWidth: string;
  customHeight: string;
  thickness: string;
  area: string; // typed in the active display unit
}

const money = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyRow = (): Row => ({
  stoneId: "",
  grade: "Standard",
  finish: "Polished",
  categoryId: "",
  sizeIndex: null,
  customWidth: "",
  customHeight: "",
  thickness: "2 cm",
  area: "",
});

export interface EditPrefill {
  proformaId: string;
  unitSystem: "sqm" | "sqf";
  rows: Row[];
  destinationCountry: string;
  destinationPort: string;
  incoterm: string;
  paymentTerm: string;
  notes: string;
}

export default function ProformaBuilder({
  stones,
  client,
  edit,
}: {
  stones: Priced[];
  client: ClientPrefill;
  edit?: EditPrefill;
}) {
  const stoneMap = useMemo(() => new Map(stones.map((s) => [s.id, s])), [stones]);

  const [c, setC] = useState<ClientPrefill>(client);
  const [unit, setUnit] = useState<"sqm" | "sqf">(edit?.unitSystem ?? "sqm");
  const [rows, setRows] = useState<Row[]>(edit?.rows.length ? edit.rows : [emptyRow()]);
  const [country, setCountry] = useState(edit?.destinationCountry ?? "");
  const [destPort, setDestPort] = useState(edit?.destinationPort ?? "");
  const [incoterm, setIncoterm] = useState(edit?.incoterm ?? "FOB");
  const [paymentTerm, setPaymentTerm] = useState(edit?.paymentTerm ?? "TT_30_70");
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Both unit systems' config already carry their own inert "custom" entry
  // (w/h = 0) — the real custom-size UX is the manually appended option
  // below, so exclude the config ones to avoid a confusing duplicate.
  const categories = (unit === "sqf" ? SIZE_CATEGORIES_IMPERIAL : SIZE_CATEGORIES_METRIC).filter(
    (cat) => cat.id !== "custom" && cat.id !== "custom-imperial"
  );
  const toM2 = (v: string) => {
    const n = parseFloat(v) || 0;
    return unit === "sqf" ? n / SQM_TO_SQF : n;
  };

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (i: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  // Compute every row using the exact same engine the server uses, so the
  // preview the client sees always matches what gets saved.
  const computed: (ProformaItem | null)[] = rows.map((r) => {
    const s = r.stoneId ? stoneMap.get(r.stoneId) : null;
    if (!s || !r.area) return null;
    return computeItem({
      stoneId: s.id,
      stoneName: s.n,
      stoneType: s.ty ?? "",
      stoneOrigin: s.c,
      stoneImage: s.image ?? "",
      basePrice: s.p,
      premiumPrice: s.pPremium ?? s.p,
      grade: r.grade,
      finish: r.finish,
      categoryId: r.categoryId,
      sizeIndex: r.sizeIndex,
      customWidth: parseFloat(r.customWidth) || 0,
      customHeight: parseFloat(r.customHeight) || 0,
      thickness: r.thickness,
      areaOrLengthInput: toM2(r.area),
    });
  });

  const validItems = computed.filter((it): it is ProformaItem => it != null);
  const subtotal = validItems.reduce((s, it) => s + it.line_total, 0);
  const totalArea = validItems.reduce((s, it) => s + it.total_m2, 0);
  const containers = containersNeeded(validItems);
  const zone = country ? zoneForCountry(country) : null;
  const shippingRate = zone?.rate_per_container_20ft ?? 0;
  const totalOceanFreight = containers * shippingRate;
  const costs = estimateIncotermCosts(incoterm, subtotal, containers, totalOceanFreight);

  const incotermDetail = INCOTERMS.find((i) => i.code === incoterm);
  const paymentDetail = PAYMENT_TERMS.find((p) => p.code === paymentTerm);
  const destPorts = country ? DESTINATION_PORTS[country] ?? [] : [];

  async function save() {
    setError("");
    if (!c.name || !c.email) return setError("Client name and email are required.");
    if (validItems.length === 0) return setError("Add at least one stone item with an area.");
    if (!country) return setError("Select a destination country.");
    if (!incoterm) return setError("Select an incoterm.");
    if (!paymentTerm) return setError("Select a payment term.");

    setBusy(true);
    try {
      const payload = {
        unitSystem: unit,
        client: c,
        destinationCountry: country,
        destinationPort: destPort,
        incoterm,
        paymentTerm,
        notes,
        items: rows
          .filter((r, i) => computed[i] != null)
          .map((r) => ({
            stoneId: r.stoneId,
            grade: r.grade,
            finish: r.finish,
            categoryId: r.categoryId,
            sizeIndex: r.sizeIndex,
            customWidth: parseFloat(r.customWidth) || 0,
            customHeight: parseFloat(r.customHeight) || 0,
            thickness: r.thickness,
            area: toM2(r.area),
          })),
      };
      const res = await fetch(edit ? `/api/proforma/${edit.proformaId}` : "/api/proforma", {
        method: edit ? "PATCH" : "POST",
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
        {rows.map((r, i) => {
          const s = r.stoneId ? stoneMap.get(r.stoneId) : null;
          const item = computed[i];
          const category = r.categoryId && r.categoryId !== "custom" ? categories.find((cat) => cat.id === r.categoryId) : null;
          const isCustom = r.categoryId === "custom";
          const size = category && r.sizeIndex != null ? category.sizes[r.sizeIndex] : null;
          const availThicknesses = isCustom
            ? Object.keys(THICKNESS_MULTIPLIER)
            : size?.t ?? Object.keys(THICKNESS_MULTIPLIER);

          return (
            <div className="pi-row" key={i}>
              <div className="pi-row-inner">
                {/* Stone + grade + preview */}
                <div className="pi-cell pi-cell-stone">
                  <label className="pi-clabel">Stone *</label>
                  <select
                    className="pi-sel"
                    value={r.stoneId}
                    onChange={(e) => setRow(i, { stoneId: e.target.value })}
                  >
                    <option value="">Select stone…</option>
                    {stones.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.n} — {st.c}
                      </option>
                    ))}
                  </select>
                  <div className="pi-grade-row">
                    <label className="pi-clabel" style={{ marginTop: 4 }}>Grade</label>
                    <select className="pi-grade" value={r.grade} onChange={(e) => setRow(i, { grade: e.target.value })}>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  {s && (
                    <div className="pi-stone-info" style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem", alignItems: "flex-start" }}>
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={s.n} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 4, flexShrink: 0, background: "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))" }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.n}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{s.ty} · {s.c}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          {r.grade === "Premium" && s.pPremium ? `$${s.pPremium}/m²` : `$${s.p}/m²`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category + size + custom dims */}
                <div className="pi-cell pi-cell-size">
                  <label className="pi-clabel">Category</label>
                  <select
                    className="pi-cat"
                    value={r.categoryId}
                    onChange={(e) => setRow(i, { categoryId: e.target.value, sizeIndex: null })}
                  >
                    <option value="">Select category…</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}{cat.multiplier !== 1 ? ` (×${cat.multiplier.toFixed(2)})` : ""}
                      </option>
                    ))}
                    <option value="custom">Custom Size (×1.20)</option>
                  </select>

                  {category && (
                    <>
                      <label className="pi-clabel" style={{ marginTop: 4 }}>Size</label>
                      <select
                        className="pi-size"
                        value={r.sizeIndex ?? ""}
                        onChange={(e) => setRow(i, { sizeIndex: e.target.value === "" ? null : Number(e.target.value) })}
                      >
                        <option value="">Select size…</option>
                        {category.sizes.map((sz, si) => (
                          <option key={si} value={si}>
                            {sz.l}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {isCustom && (
                    <div className="pi-custom-dims" style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                      <div>
                        <label className="pi-clabel">W (cm)</label>
                        <input className="pi-num pf-input" type="number" min="1" step="0.1" value={r.customWidth} onChange={(e) => setRow(i, { customWidth: e.target.value })} />
                      </div>
                      <div>
                        <label className="pi-clabel">H (cm)</label>
                        <input className="pi-num pf-input" type="number" min="1" step="0.1" value={r.customHeight} onChange={(e) => setRow(i, { customHeight: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {size && (
                    <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", opacity: 0.7 }}>
                      {size.w}×{size.h} cm — {((size.w * size.h) / 10000).toFixed(3)} m²/piece
                    </div>
                  )}
                </div>

                {/* Thickness + finish + area */}
                <div className="pi-cell pi-cell-detail">
                  <label className="pi-clabel">Thickness</label>
                  <select className="pi-thk" value={r.thickness} onChange={(e) => setRow(i, { thickness: e.target.value })}>
                    {availThicknesses.map((t) => (
                      <option key={t} value={t}>
                        {t}{THICKNESS_MULTIPLIER[t] !== 1 ? ` (×${THICKNESS_MULTIPLIER[t].toFixed(2)})` : ""}
                      </option>
                    ))}
                  </select>
                  <label className="pi-clabel" style={{ marginTop: 4 }}>Finish</label>
                  <select className="pi-finish" value={r.finish} onChange={(e) => setRow(i, { finish: e.target.value })}>
                    {FINISHES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <label className="pi-clabel" style={{ marginTop: 4 }}>
                    Total area ({unit === "sqf" ? "ft²" : "m²"}) needed
                  </label>
                  <input
                    className="pi-qty pf-input"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Total area needed"
                    value={r.area}
                    onChange={(e) => setRow(i, { area: e.target.value })}
                  />
                </div>

                {/* Price breakdown */}
                <div className="pi-cell pi-cell-price">
                  {item ? (
                    <div className="pi-subtotals">
                      <div className="pi-sub-row"><span>Unit price:</span> <strong>{money(unit === "sqf" ? item.adjusted_unit_price / SQM_TO_SQF : item.adjusted_unit_price)}/{unit === "sqf" ? "ft²" : "m²"}</strong></div>
                      <div className="pi-sub-row"><span>Area:</span> <strong>{r.area || "0"} {unit === "sqf" ? "ft²" : "m²"}</strong></div>
                      <div className="pi-sub-row pi-lt-row"><span>Line total:</span> <strong>{money(item.line_total)}</strong></div>
                    </div>
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>Select a stone, size, and area</span>
                  )}
                </div>

                <div className="pi-cell pi-cell-del">
                  {rows.length > 1 && (
                    <button type="button" className="pi-del" onClick={() => removeRow(i)} aria-label="Remove item" title="Remove item">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" className="pf-add-item" onClick={addRow} style={{ marginTop: "0.75rem" }}>
          <i className="fa-solid fa-plus" /> Add item
        </button>
      </div>

      {/* Incoterm + payment terms */}
      <div className="pf-section">
        <h2>
          <i className="fa-solid fa-file-contract" /> Incoterm & payment
        </h2>
        <div className="pf-grid-2">
          <div>
            <label className="pf-label">Incoterm *</label>
            <select className="pf-input" value={incoterm} onChange={(e) => setIncoterm(e.target.value)}>
              {INCOTERMS.filter((it) => SELECTABLE_INCOTERMS.includes(it.code)).map((it) => (
                <option key={it.code} value={it.code}>{it.code} — {it.name}</option>
              ))}
            </select>
            <p className="pf-note" style={{ marginTop: "0.35rem", fontSize: "0.78rem", opacity: 0.7 }}>
              Need Delivered at Place / Delivered Duty Paid? Contact our trade team — these
              require case-by-case customs arrangements in your country.
            </p>
            {incotermDetail && (
              <div className="inc-detail" style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.85 }}>
                <p style={{ marginBottom: "0.35rem" }}>{incotermDetail.description}</p>
                <p><strong>Buyer:</strong> {incotermDetail.buyer_responsibility}</p>
                <p><strong>Seller:</strong> {incotermDetail.seller_responsibility}</p>
                <p><strong>Risk transfers:</strong> {incotermDetail.risk_transfer}</p>
              </div>
            )}
          </div>
          <div>
            <label className="pf-label">Payment term *</label>
            <select className="pf-input" value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)}>
              {PAYMENT_TERMS.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            {paymentDetail && (
              <div className="pf-payment-info" style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.85 }}>
                <p style={{ marginBottom: "0.35rem" }}>{paymentDetail.description}</p>
                <p style={{ opacity: 0.7 }}>{paymentDetail.requirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="pf-section">
        <h2>
          <i className="fa-solid fa-ship" /> Shipping destination
        </h2>
        <div className="pf-grid-2">
          <div>
            <label className="pf-label">Destination country *</label>
            <select className="pf-input" value={country} onChange={(e) => (setCountry(e.target.value), setDestPort(""))}>
              <option value="">Select…</option>
              {DESTINATION_COUNTRIES.map((co) => <option key={co}>{co}</option>)}
            </select>
          </div>
          <div>
            <label className="pf-label">Destination port</label>
            <select className="pf-input" value={destPort} onChange={(e) => setDestPort(e.target.value)} disabled={!destPorts.length}>
              <option value="">{destPorts.length ? "Select…" : "Select a country first"}</option>
              {destPorts.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        {zone && (
          <p className="pf-note" style={{ marginTop: "0.75rem" }}>
            <i className="fa-solid fa-info-circle" /> Zone: <strong>{zone.zone}</strong> · {money(zone.rate_per_container_20ft)}/container · transit {zone.transit_days} days
          </p>
        )}
        <label className="pf-label" style={{ marginTop: "1rem", display: "block" }}>Notes for our team</label>
        <textarea className="pf-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions, delivery constraints, etc." />
      </div>

      {/* Totals */}
      <div className="pf-section pf-summary">
        <h2>
          <i className="fa-solid fa-receipt" /> Summary
        </h2>
        <div className="pf-summary-row"><span>Total area</span><span>{totalArea.toLocaleString("en-US", { maximumFractionDigits: 2 })} m²</span></div>
        <div className="pf-summary-row"><span>Goods subtotal</span><span>{money(subtotal)}</span></div>
        <div className="pf-summary-row"><span>Containers (20ft)</span><span>{containers}</span></div>
        {costs.breakdown.filter((b) => b.included && b.amount > 0).map((b) => (
          <div className="pf-summary-row" key={b.code} style={{ opacity: 0.8, fontSize: "0.85rem" }}>
            <span>{b.label}</span><span>{money(b.amount)}</span>
          </div>
        ))}
        <div className="pf-summary-row pf-summary-total"><span>Grand total ({incoterm})</span><span>{money(costs.grandTotal)}</span></div>
        <p className="pf-disclaimer" style={{ opacity: 0.6, fontSize: "0.8rem", marginTop: "0.75rem" }}>{SHIPPING_DISCLAIMER}</p>

        {error && <div style={{ color: "#c0392b", margin: "0.75rem 0" }}>{error}</div>}
        <button type="button" className="pf-btn pf-btn-primary" disabled={busy} onClick={save} style={{ marginTop: "0.5rem" }}>
          {busy ? "Saving…" : edit ? "Save changes" : "Create proforma"} <i className="fa-solid fa-file-invoice" />
        </button>
      </div>
    </div>
  );
}
