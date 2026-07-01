"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="pf-btn pf-btn-primary no-print" onClick={() => window.print()}>
      <i className="fa-solid fa-print" /> {label}
    </button>
  );
}
