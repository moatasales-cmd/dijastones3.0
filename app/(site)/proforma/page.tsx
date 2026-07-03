import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/lang";
import ProformaBuilder, { type Priced, type ClientPrefill } from "@/components/ProformaBuilder";
import { buildProformaBuilderStrings } from "@/lib/proforma-builder-strings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.proforma") };
}

export default async function ProformaPage() {
  const { t } = await getT();
  const client = await getCurrentClient();

  if (!client) {
    return (
      <section className="auth-page">
        <div className="auth-container" style={{ maxWidth: 520 }}>
          <div className="auth-header">
            <div className="hero-label">{t("proforma.signin_label")}</div>
            <h1>{t("proforma.signin_title")}</h1>
            <p>{t("proforma.signin_text")}</p>
          </div>
          <div className="auth-card" style={{ textAlign: "center", padding: "2.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--accent)" }}>
              <i className="fa-solid fa-file-invoice" />
            </div>
            <h3 style={{ marginBottom: "1rem", fontWeight: 400 }}>{t("proforma.signin_why")}</h3>
            <ul style={{ textAlign: "left", display: "inline-block", listStyle: "none", padding: 0, marginBottom: "1.5rem", lineHeight: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>
                  <i className="fa-solid fa-check" style={{ color: "var(--accent)", marginRight: 8 }} />{" "}
                  {t(`proforma.signin_reason_${i}`)}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" className="pf-btn pf-btn-primary">{t("proforma.signin_btn")}</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const stoneRows = await prisma.stone.findMany({
    where: { p: { not: null } },
    select: { id: true, n: true, p: true, pPremium: true, ty: true, c: true, g: true },
    orderBy: { n: "asc" },
  });
  const stones: Priced[] = stoneRows.map((s) => ({
    id: s.id,
    n: s.n,
    p: s.p as number,
    pPremium: s.pPremium,
    ty: s.ty,
    c: s.c,
    image: (Array.isArray(s.g) ? (s.g as string[])[0] : null) ?? null,
  }));

  const prefill: ClientPrefill = {
    name: client.name || client.fullName || "",
    email: client.email,
    company: client.companyName || "",
    phone: client.phone || "",
    address: client.address || "",
    city: client.city || "",
    country: client.country || "",
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("proforma.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("proforma.hero_title"))} />
          <p>{t("proforma.hero_text")}</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <ProformaBuilder stones={stones} client={prefill} strings={buildProformaBuilderStrings(t)} />
        </div>
      </section>
    </>
  );
}
