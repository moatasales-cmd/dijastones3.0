"use client";

import { useState } from "react";

export default function NewsletterForm({
  placeholder,
  submitLabel,
}: {
  placeholder: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setMsg({ text: json.message || json.error, ok: !!json.ok });
      if (json.ok) setEmail("");
    } catch {
      setMsg({ text: "Something went wrong.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="newsletter-form" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          placeholder={placeholder}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={busy}>
          {submitLabel}
        </button>
      </form>
      {msg && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: msg.ok ? "var(--accent)" : "#c0392b" }}>
          {msg.text}
        </p>
      )}
    </>
  );
}
