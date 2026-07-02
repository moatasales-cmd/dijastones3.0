import Link from "next/link";
import SignOutButton from "./SignOutButton";

/** Sub-navigation shown on all account pages. */
export default function AccountNav({
  active,
  labels,
}: {
  active: "dashboard" | "proformas";
  labels: { dashboard: string; proformas: string; newProforma: string; signOut: string };
}) {
  const tab = (href: string, key: string, label: string, icon: string) => (
    <Link
      href={href}
      className="pf-btn pf-btn-sm"
      style={{
        background: active === key ? "var(--accent)" : "transparent",
        color: active === key ? "#fff" : "var(--text)",
        border: "1px solid " + (active === key ? "var(--accent)" : "var(--border)"),
      }}
    >
      <i className={`fa-solid ${icon}`} /> {label}
    </Link>
  );

  return (
    <div
      className="account-nav"
      style={{
        display: "flex",
        gap: "0.6rem",
        flexWrap: "wrap",
        alignItems: "center",
        margin: "1.25rem 0 0",
      }}
    >
      {tab("/account", "dashboard", labels.dashboard, "fa-gauge-high")}
      {tab("/account/proformas", "proformas", labels.proformas, "fa-file-invoice")}
      <Link href="/proforma" className="pf-btn pf-btn-sm" style={{ border: "1px dashed var(--border)", color: "var(--text)" }}>
        <i className="fa-solid fa-plus" /> {labels.newProforma}
      </Link>
      <span style={{ marginLeft: "auto" }}>
        <SignOutButton label={labels.signOut} />
      </span>
    </div>
  );
}
