import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("casestudy.title") };
}

interface MaterialMatch {
  matchType: "exact" | "similar" | "none";
  stoneName: string | null;
}

export default async function CaseStudiesPage() {
  const { t } = await getT();
  const cases = await prisma.caseStudy.findMany({ orderBy: { title: "asc" } });

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("casestudy.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("casestudy.hero_title"))} />
          <p>{t("casestudy.hero_text")}</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="grid-3">
            {cases.map((c) => {
              const materials = Array.isArray(c.materials) ? (c.materials as unknown as MaterialMatch[]) : [];
              const bestMatch = materials.find((m) => m.matchType === "exact") ?? materials.find((m) => m.matchType === "similar");
              return (
                <Link
                  key={c.id}
                  href={`/case-studies/${c.id}`}
                  className="card-article stagger-fade"
                  style={{ padding: "1.5rem", border: "1px solid var(--border-light)" }}
                >
                  <div className="card-meta">
                    {[c.location, c.year].filter(Boolean).join(" · ")}
                  </div>
                  <h3>{c.title}</h3>
                  {c.architect && <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>{c.architect}</p>}
                  {bestMatch?.stoneName && (
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      <i className="fa-solid fa-gem" style={{ marginRight: "0.4rem", opacity: 0.6 }} />
                      {bestMatch.stoneName}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
