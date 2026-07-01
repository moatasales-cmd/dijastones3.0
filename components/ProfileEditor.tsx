"use client";

import { useState } from "react";
import type { ProfileField } from "@/lib/profile";

export default function ProfileEditor({
  fields,
  initial,
  labels,
}: {
  fields: ProfileField[];
  initial: Record<string, string>;
  labels: { edit: string; save: string; cancel: string; saved: string };
}) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((r) => r.json());
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      // Reload so the server recomputes completion + header name.
      setTimeout(() => window.location.reload(), 500);
    }
  }

  if (!editing) {
    return (
      <div className="dash-profile-grid">
        {fields.map((f) => (
          <div className="dash-profile-item" key={f.key}>
            <span className="dash-profile-label">
              <i
                className={`fa-solid ${
                  values[f.key] ? "fa-circle-check dash-icon-ok" : "fa-circle dash-icon-missing"
                }`}
              />{" "}
              {f.label}
            </span>
            <span className="dash-profile-value">{values[f.key] || "—"}</span>
          </div>
        ))}
        <button className="dash-edit-btn" onClick={() => setEditing(true)}>
          <i className="fa-solid fa-pen" /> {labels.edit}
        </button>
      </div>
    );
  }

  return (
    <div className="dash-profile-grid">
      {fields.map((f) => (
        <div className="auth-field" key={f.key}>
          <label className="auth-label">{f.label}</label>
          {f.options ? (
            <select
              className="pf-input"
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            >
              <option value="">—</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="pf-input"
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="dash-actions">
        <button className="pf-btn pf-btn-primary" disabled={busy} onClick={save}>
          {saved ? labels.saved : labels.save}
        </button>
        <button className="pf-btn" onClick={() => setEditing(false)} disabled={busy}>
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
