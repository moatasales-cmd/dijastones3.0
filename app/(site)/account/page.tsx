import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import Link from "next/link";
import { calcCompletion, PROFILE_FIELDS } from "@/lib/profile";
import ProfileEditor from "@/components/ProfileEditor";
import MaterialCard, { type CardLabels } from "@/components/MaterialCard";
import AccountNav from "@/components/AccountNav";
import FavoritesSync from "@/components/FavoritesSync";
import RemoveFavoriteButton from "@/components/RemoveFavoriteButton";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.client_dashboard") };
}

interface ActivityEntry {
  action: string;
  details?: string;
  timestamp?: string;
}

export default async function AccountPage() {
  const client = await getCurrentClient();
  if (!client) redirect("/login");

  const { t } = await getT();
  const { percent } = calcCompletion(client as unknown as Record<string, unknown>);

  const favRows = await prisma.favorite.findMany({
    where: { clientId: client.id },
    select: { stoneId: true },
  });
  const favStones = favRows.length
    ? await prisma.stone.findMany({
        where: { id: { in: favRows.map((f) => f.stoneId) } },
        select: { id: true, n: true, c: true, ci: true, ty: true, to: true, cn: true, p: true, pPremium: true, g: true, dm: true },
      })
    : [];

  // Recent proformas for the dashboard card.
  const proformas = await prisma.proforma.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, createdAt: true, destinationCountry: true, grandTotal: true, status: true },
  });
  const proformaCount = await prisma.proforma.count({ where: { clientId: client.id } });

  const activity: ActivityEntry[] = Array.isArray(client.activityLog)
    ? [...(client.activityLog as unknown as ActivityEntry[])].reverse().slice(0, 10)
    : [];

  const initial: Record<string, string> = {};
  for (const f of PROFILE_FIELDS) {
    const v = (client as unknown as Record<string, unknown>)[f.key];
    initial[f.key] = typeof v === "string" ? v : "";
  }

  const cardLabels: CardLabels = {
    from: t("materials.from"),
    premium: t("materials.premium"),
    exworks: t("materials.exworks_label"),
    exworksTitle: t("materials.exworks_title"),
    addFavorite: t("materials.add_favorite"),
  };

  const displayName = client.name || client.fullName || client.email;

  const money = (v: number | null) =>
    "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="auth-page">
      <FavoritesSync serverIds={favRows.map((f) => f.stoneId)} />
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="dash-header">
          <div>
            <div className="hero-label">My Account</div>
            <h1>Welcome, {displayName}</h1>
            <p className="dash-member-since">
              {client.email}
              {client.createdAt ? ` · Member since ${client.createdAt.slice(0, 10)}` : ""}
            </p>
          </div>
        </div>
        <AccountNav
          active="dashboard"
          labels={{ dashboard: "Dashboard", proformas: `My Proformas (${proformaCount})`, newProforma: "New proforma", signOut: "Sign Out" }}
        />

        {/* Recent proformas */}
        <div className="info-card" style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-file-invoice" style={{ color: "var(--accent)" }} /> Recent proformas
            </h3>
            <Link href="/account/proformas" className="auth-link" style={{ fontSize: "0.85rem" }}>
              View all ({proformaCount}) <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          {proformas.length === 0 ? (
            <p className="dash-empty" style={{ marginTop: "0.75rem" }}>
              No proformas yet. <Link href="/proforma" className="auth-link">Create your first quote</Link>.
            </p>
          ) : (
            <div className="dash-activity-list" style={{ marginTop: "0.75rem" }}>
              {proformas.map((p) => (
                <Link
                  key={p.id}
                  href={`/proforma/${p.id}`}
                  className="dash-activity-item"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>
                    <strong>{p.id}</strong>
                    <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                      {" "}· {p.createdAt?.slice(0, 10)} · {p.destinationCountry}
                    </span>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {money(p.grandTotal)}{" "}
                    <span style={{ opacity: 0.7, fontSize: "0.8rem" }}>({p.status})</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile completion */}
        <div className="info-card" style={{ marginTop: "2rem" }}>
          <div className="dash-progress-wrap">
            <div className="dash-customize-bar-label">
              <span>Profile completion</span>
              <span className="dash-pct-badge">{percent}%</span>
            </div>
            <div className="dash-progress-bar">
              <div className="dash-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <h3 style={{ marginTop: "1.5rem" }}>Your details</h3>
          <ProfileEditor
            fields={PROFILE_FIELDS}
            initial={initial}
            labels={{ edit: "Edit profile", save: "Save changes", cancel: "Cancel", saved: "Saved ✓" }}
          />
        </div>

        {/* Favorites */}
        <div style={{ marginTop: "2.5rem" }}>
          <h2>My Favorites</h2>
          {favStones.length === 0 ? (
            <p className="dash-empty">
              You haven&apos;t saved any stones yet. Browse the{" "}
              <a href="/materials" className="auth-link">materials</a> and tap the heart.
            </p>
          ) : (
            <div className="grid-4" style={{ marginTop: "1.5rem" }}>
              {favStones.map((s) => (
                <div key={s.id}>
                  <MaterialCard stone={s} unit="sqm" labels={cardLabels} />
                  <RemoveFavoriteButton stoneId={s.id} label="Remove" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        {activity.length > 0 && (
          <div style={{ marginTop: "2.5rem" }}>
            <h2>Recent activity</h2>
            <div className="dash-activity-list" style={{ marginTop: "1rem" }}>
              {activity.map((a, i) => (
                <div className="dash-activity-item" key={i}>
                  <span className="dash-activity-action">{a.action.replace(/_/g, " ")}</span>
                  {a.details ? <span className="dash-activity-details">{a.details}</span> : null}
                  <span className="dash-activity-time">{a.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
