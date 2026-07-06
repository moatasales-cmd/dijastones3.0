import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.caseStudy.findUnique({ where: { id } });
  return { title: c ? c.title : "Case Study" };
}

interface MaterialMatch {
  application: string;
  rawStone: string;
  stoneId: string | null;
  stoneName: string | null;
  matchType: "exact" | "similar" | "none";
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const c = await prisma.caseStudy.findUnique({ where: { id } });
  if (!c) notFound();

  const materials = Array.isArray(c.materials) ? (c.materials as unknown as MaterialMatch[]) : [];
  const matched = materials.filter((m) => m.matchType !== "none" && m.stoneId);

  const specs: [string, string | null][] = [
    [t("casestudy.spec_architect"), c.architect],
    [t("casestudy.spec_location"), c.location],
    [t("casestudy.spec_year"), c.year],
    [t("casestudy.spec_area"), c.area],
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/case-studies" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("casestudy.back")}
          </Link>
          <div className="hero-label">{t("casestudy.hero_label")}</div>
          <h1 className="hero-title">{c.title}</h1>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container narrow">
          <div className="detail-specs">
            {specs
              .filter(([, val]) => val)
              .map(([label, val]) => (
                <div className="spec" key={label}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-val">{val}</span>
                </div>
              ))}
          </div>

          <h2 style={{ marginTop: "2rem" }}>{t("casestudy.materials_used")}</h2>
          {matched.length === 0 ? (
            <p style={{ opacity: 0.7 }}>{t("casestudy.no_materials")}</p>
          ) : (
            <div className="detail-specs">
              {matched.map((m, i) => (
                <div className="spec" key={i}>
                  <span className="spec-label">{m.application || t("casestudy.materials_used")}</span>
                  <span className="spec-val">
                    <Link href={`/materials/${m.stoneId}`}>
                      <i className="fa-solid fa-gem" /> {m.stoneName}
                    </Link>
                    <span style={{ display: "block", fontSize: "0.75rem", opacity: 0.6 }}>
                      {m.matchType === "exact" ? t("casestudy.exact_match") : t("casestudy.similar_match")}
                      {" — "}
                      {m.rawStone}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <p style={{ marginTop: "2rem" }}>
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="pf-btn pf-btn-ghost">
              <i className="fa-solid fa-arrow-up-right-from-square" /> {t("casestudy.view_source")}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
