import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import Gallery from "@/components/Gallery";
import MaterialCard, { type CardLabels } from "@/components/MaterialCard";

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
  const matched = materials.filter(
    (m, i, arr): m is MaterialMatch & { stoneId: string } =>
      m.matchType !== "none" && !!m.stoneId && arr.findIndex((x) => x.stoneId === m.stoneId) === i
  );

  // The stones actually used/matched — not photos of the third-party
  // building itself (we never re-host that copyrighted photography). This
  // gallery shows what the matched material(s) genuinely look like.
  const matchedStones = matched.length
    ? await prisma.stone.findMany({ where: { id: { in: matched.map((m) => m.stoneId) } } })
    : [];
  const galleryImages = matchedStones.flatMap((s) => (Array.isArray(s.g) ? (s.g as string[]).slice(0, 1) : []));

  const cardLabels: CardLabels = {
    from: t("materials.from"),
    premium: t("materials.premium"),
    exworks: t("materials.exworks_label"),
    exworksTitle: t("materials.exworks_title"),
    addFavorite: t("materials.add_favorite"),
  };

  const specs: [string, string | null][] = [
    [t("casestudy.spec_architect"), c.architect],
    [t("casestudy.spec_location"), c.location],
    [t("casestudy.spec_year"), c.year],
    [t("casestudy.spec_area"), c.area],
  ];

  return (
    <div className="case-study-detail">
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
        <div className="container">
          <div className="detail-grid">
            <div>
              <Gallery images={galleryImages} alt={c.title} />
            </div>
            <div className="detail-info">
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

              <p style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {c.articleId && (
                  <Link href={`/journal/${c.articleId}`} className="pf-btn pf-btn-primary">
                    <i className="fa-solid fa-book-open" /> {t("casestudy.read_story")}
                  </Link>
                )}
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="pf-btn pf-btn-ghost">
                  <i className="fa-solid fa-arrow-up-right-from-square" /> {t("casestudy.view_source")}
                </a>
              </p>
            </div>
          </div>

          <h2 style={{ marginTop: "3rem" }}>{t("casestudy.materials_used")}</h2>
          {matchedStones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>{t("casestudy.no_materials")}</p>
          ) : (
            <div className="grid-4" style={{ marginTop: "1.5rem" }}>
              {matchedStones.map((s) => {
                const m = matched.find((x) => x.stoneId === s.id)!;
                return (
                  <div key={s.id}>
                    <MaterialCard stone={s} unit="sqm" labels={cardLabels} />
                    <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.4rem" }}>
                      {m.matchType === "exact"
                        ? t("casestudy.exact_match")
                        : m.matchType === "similar"
                        ? t("casestudy.similar_match")
                        : t("casestudy.suggested_match")}
                      {" — "}
                      {m.application ? `${m.application}: ` : ""}
                      {m.rawStone}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
