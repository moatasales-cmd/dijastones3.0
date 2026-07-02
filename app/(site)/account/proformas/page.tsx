import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import AccountNav from "@/components/AccountNav";

const STATUS_COLORS: Record<string, string> = {
  draft: "var(--text-light)",
  sent: "#2d6cdf",
  accepted: "#2d7d46",
  declined: "#c0392b",
  expired: "#c97d2d",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.client_proformas") };
}

const money = (v: number | null) =>
  "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function ProformasListPage() {
  const client = await getCurrentClient();
  if (!client) redirect("/login");

  const proformas = await prisma.proforma.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="auth-page">
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="dash-header">
          <div>
            <div className="hero-label">My Account</div>
            <h1>My Proformas</h1>
          </div>
        </div>
        <AccountNav
          active="proformas"
          labels={{ dashboard: "Dashboard", proformas: `My Proformas (${proformas.length})`, newProforma: "New proforma", signOut: "Sign Out" }}
        />

        {proformas.length === 0 ? (
          <p className="dash-empty" style={{ marginTop: "2rem" }}>
            You haven&apos;t created any proformas yet.{" "}
            <Link href="/proforma" className="auth-link">Start one</Link>.
          </p>
        ) : (
          <div className="dash-activity-list" style={{ marginTop: "2rem" }}>
            {proformas.map((p) => (
              <Link key={p.id} href={`/proforma/${p.id}`} className="dash-activity-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  <strong>{p.id}</strong>
                  <br />
                  <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                    {p.createdAt?.slice(0, 10)} · {p.destinationCountry} · {p.incoterm}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  {money(p.grandTotal)}
                  <br />
                  <span
                    className="pf-status"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[p.status ?? "draft"] ?? "var(--text-light)",
                    }}
                  >
                    {p.status}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
