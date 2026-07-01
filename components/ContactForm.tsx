"use client";

import { useState } from "react";

interface Opt {
  value: string;
  label: string;
}
export interface ContactFormLabels {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  submit: string;
  sending: string;
  selectOffice: string;
  officesLabel: string;
  partnersLabel: string;
  success: string;
  error: string;
}

export default function ContactForm({
  offices,
  partners,
  labels: L,
}: {
  offices: Opt[];
  partners: Opt[];
  labels: ContactFormLabels;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus("ok");
        setMsg(L.success);
        form.reset();
      } else {
        setStatus("error");
        setMsg(json.error || L.error);
      }
    } catch {
      setStatus("error");
      setMsg(L.error);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
        <input type="text" name="name" placeholder={`${L.name} *`} required />
        <input type="email" name="email" placeholder={`${L.email} *`} required />
      </div>
      <input type="tel" name="phone" placeholder={L.phone} />
      <input type="text" name="company" placeholder={L.company} />
      <select name="office" defaultValue="">
        <option value="">{L.selectOffice}</option>
        <optgroup label={`DIJA ${L.officesLabel}`}>
          {offices.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
        <optgroup label={L.partnersLabel}>
          {partners.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      </select>
      <textarea name="message" placeholder={L.message} rows={5} required />
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? L.sending : L.submit}
      </button>
      {msg && (
        <div
          className="qf-msg"
          style={{ color: status === "ok" ? "var(--accent)" : "#c0392b", marginTop: "0.75rem" }}
        >
          {msg}
        </div>
      )}
    </form>
  );
}
