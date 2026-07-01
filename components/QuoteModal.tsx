"use client";

import { useState } from "react";

export interface QuoteLabels {
  requestQuote: string;
  name: string;
  namePh: string;
  email: string;
  emailPh: string;
  phone: string;
  phonePh: string;
  area: string;
  areaPh: string;
  message: string;
  messagePh: string;
  submit: string;
  sending: string;
  close: string;
}

export default function QuoteModal({
  stoneId,
  stoneName,
  labels: L,
}: {
  stoneId: string;
  stoneName: string;
  labels: QuoteLabels;
}) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState("m²");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, stoneId, stoneName, areaUnit: unit }),
      });
      const json = await res.json();
      setMsg({ text: json.message || json.error, ok: !!json.ok });
      if (json.ok) form.reset();
    } catch {
      setMsg({ text: "Something went wrong.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="detail-btn" onClick={() => setOpen(true)}>
        <i className="fa-solid fa-calculator" /> {L.requestQuote}
      </button>

      {open && (
        <div
          className="modal-overlay"
          style={{ display: "flex" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="modal-card">
            <button className="modal-close" onClick={() => setOpen(false)} aria-label={L.close}>
              &times;
            </button>
            <div className="modal-hdr">
              <span className="modal-label">{L.requestQuote}</span>
              <h3 className="modal-title">{stoneName}</h3>
            </div>
            <form onSubmit={onSubmit}>
              <div className="qf-row">
                <div className="qf-field">
                  <label>
                    {L.name} <span className="qf-req">*</span>
                  </label>
                  <input type="text" name="name" required placeholder={L.namePh} />
                </div>
                <div className="qf-field">
                  <label>
                    {L.email} <span className="qf-req">*</span>
                  </label>
                  <input type="email" name="email" required placeholder={L.emailPh} />
                </div>
              </div>
              <div className="qf-row">
                <div className="qf-field">
                  <label>
                    {L.phone} <span className="qf-req">*</span>
                  </label>
                  <input type="tel" name="phone" required placeholder={L.phonePh} />
                </div>
                <div className="qf-field">
                  <label>{L.area}</label>
                  <div className="area-wrap">
                    <input type="number" name="area" placeholder={L.areaPh} min="0" step="any" />
                    <div className="unit-toggle">
                      {["m²", "ft²"].map((u) => (
                        <button
                          type="button"
                          key={u}
                          className={`unit-pill${unit === u ? " active" : ""}`}
                          onClick={() => setUnit(u)}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="qf-field">
                <label>{L.message}</label>
                <textarea name="message" rows={3} placeholder={L.messagePh} />
              </div>
              <button type="submit" className="btn btn-primary qf-submit" disabled={busy}>
                {busy ? L.sending : L.submit}
              </button>
              {msg && (
                <div
                  className="qf-msg"
                  style={{ color: msg.ok ? "var(--accent)" : "#c0392b", marginTop: "0.75rem" }}
                >
                  {msg.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
