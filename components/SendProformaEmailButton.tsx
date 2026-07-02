"use client";

import { useState } from "react";

export default function SendProformaEmailButton({
  proformaId,
  toEmail,
}: {
  proformaId: string;
  toEmail: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function send() {
    setState("sending");
    setMsg("");
    try {
      const res = await fetch(`/api/proforma/${encodeURIComponent(proformaId)}/send`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok) {
        setState("sent");
        setMsg(json.devMode ? `Logged to server console (no SMTP configured yet).` : `Sent to ${toEmail}.`);
      } else {
        setState("error");
        setMsg(json.error || "Could not send the email.");
      }
    } catch {
      setState("error");
      setMsg("Could not send the email.");
    }
  }

  return (
    <div className="no-print" style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
      <button
        type="button"
        className="pf-btn pf-btn-primary"
        onClick={send}
        disabled={state === "sending"}
        title={`Email this proforma as a PDF to ${toEmail}`}
      >
        <i className={`fa-solid ${state === "sending" ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />{" "}
        {state === "sending" ? "Sending…" : "Send to my email"}
      </button>
      {msg && (
        <span style={{ fontSize: "0.75rem", color: state === "error" ? "#c0392b" : "var(--accent)" }}>
          {msg}
        </span>
      )}
    </div>
  );
}
