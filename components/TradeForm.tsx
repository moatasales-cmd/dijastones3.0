"use client";

import { useState } from "react";

interface Opt {
  v: string;
  l: string;
}

// Label bag — keys resolved server-side and passed in (keeps messages off client).
export type TradeLabels = Record<string, string>;

export default function TradeForm({
  L,
  roles,
  volumes,
  values,
}: {
  L: TradeLabels;
  roles: Opt[];
  volumes: Opt[];
  values: Opt[];
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, unknown> = Object.fromEntries(fd.entries());
    data.values = fd.getAll("values");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setDone(true);
      else setError(json.error || "Something went wrong.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="trade-success" style={{ display: "block" }}>
        <div className="trade-success-icon">
          <i className="fa-solid fa-check-circle" />
        </div>
        <h3>{L.success_title}</h3>
        <p>{L.success_text}</p>
        <p>
          {L.success_contact} <a href="mailto:trade@dijastones.com">trade@dijastones.com</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="trade-form-glass" onSubmit={onSubmit}>
      <div className="trade-step">
        <div className="trade-step-header">
          <span className="trade-step-num">01</span>
          <span className="trade-step-label">{L.step_about}</span>
        </div>
        <div className="trade-step-body">
          <div className="trade-field">
            <label>
              {L.field_name} <span className="trade-req">*</span>
            </label>
            <input type="text" name="name" required placeholder={L.field_name_ph} />
          </div>
          <div className="trade-field-row">
            <div className="trade-field">
              <label>
                {L.field_email} <span className="trade-req">*</span>
              </label>
              <input type="email" name="email" required placeholder={L.field_email_ph} />
            </div>
            <div className="trade-field">
              <label>{L.field_phone}</label>
              <input type="tel" name="phone" placeholder={L.field_phone_ph} />
            </div>
          </div>
          <div className="trade-field-row">
            <div className="trade-field">
              <label>
                {L.field_company} <span className="trade-req">*</span>
              </label>
              <input type="text" name="company" required placeholder={L.field_company_ph} />
            </div>
            <div className="trade-field">
              <label>
                {L.field_role} <span className="trade-req">*</span>
              </label>
              <select name="role" required defaultValue="">
                <option value="">{L.role_select}</option>
                {roles.map((r) => (
                  <option key={r.v} value={r.v}>
                    {r.l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="trade-step-divider" />

      <div className="trade-step">
        <div className="trade-step-header">
          <span className="trade-step-num">02</span>
          <span className="trade-step-label">{L.step_practice}</span>
        </div>
        <div className="trade-step-body">
          <div className="trade-field">
            <label>{L.field_referral}</label>
            <input type="text" name="referral" placeholder={L.field_referral_ph} />
          </div>
          <div className="trade-field">
            <label>
              {L.field_values} <span className="trade-req">*</span>
            </label>
            <div className="trade-checkbox-grid">
              {values.map((v) => (
                <label className="trade-checkbox-card" key={v.v}>
                  <input type="checkbox" name="values" value={v.v} />
                  <span>
                    <i className="fa-regular fa-circle-check" /> {v.l}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="trade-field">
            <label>
              {L.field_project} <span className="trade-req">*</span>
            </label>
            <textarea name="project_example" rows={4} placeholder={L.field_project_ph} required />
          </div>
        </div>
      </div>

      <div className="trade-step-divider" />

      <div className="trade-step">
        <div className="trade-step-header">
          <span className="trade-step-num">03</span>
          <span className="trade-step-label">{L.step_requirements}</span>
        </div>
        <div className="trade-step-body">
          <div className="trade-field-row">
            <div className="trade-field">
              <label>{L.field_volume}</label>
              <select name="volume" defaultValue="">
                <option value="">{L.volume_select}</option>
                {volumes.map((v) => (
                  <option key={v.v} value={v.v}>
                    {v.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="trade-field">
              <label>{L.field_stone_interest}</label>
              <input type="text" name="stone_interest" placeholder={L.field_stone_interest_ph} />
            </div>
          </div>
          <div className="trade-field">
            <label>{L.field_notes}</label>
            <textarea name="notes" rows={3} placeholder={L.field_notes_ph} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary trade-submit-btn" disabled={busy}>
        {busy ? L.submitting : L.submit}
      </button>
      {error && (
        <div style={{ color: "#e57373", marginTop: "1rem" }}>{error}</div>
      )}
    </form>
  );
}
