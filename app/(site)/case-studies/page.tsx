import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/seo";
import { rich } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return pageMeta({ title: t("casestudy.title"), description: t("casestudy.hero_text"), path: "/case-studies" });
}

interface MaterialMatch {
  matchType: "exact" | "similar" | "suggested" | "none";
  stoneId: string | null;
  stoneName: string | null;
}

export default async function CaseStudiesPage() {
  const { t } = await getT();
  const cases = await prisma.caseStudy.findMany({ orderBy: { title: "asc" } });

  const allStoneIds = new Set<string>();
  const casesWithMaterials = cases.map((c) => {
    const materials = Array.isArray(c.materials) ? (c.materials as unknown as MaterialMatch[]) : [];
    for (const m of materials) if (m.stoneId) allStoneIds.add(m.stoneId);
    return { c, materials };
  });

  const stones = allStoneIds.size
    ? await prisma.stone.findMany({ where: { id: { in: [...allStoneIds] } } })
    : [];
  const stoneById = new Map(stones.map((s) => [s.id, s]));

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
            {casesWithMaterials.map(({ c, materials }) => {
              const matchedStones = materials
                .filter((m) => m.matchType !== "none" && m.stoneId)
                .map((m) => stoneById.get(m.stoneId!))
                .filter((s): s is NonNullable<typeof s> => !!s);
              const uniqueStones = [...new Map(matchedStones.map((s) => [s.id, s])).values()];
              const ownGallery = Array.isArray(c.g) ? (c.g as string[]) : [];
              const coverStone = uniqueStones[0];
              const coverImg = ownGallery[0] ?? (coverStone && Array.isArray(coverStone.g) ? (coverStone.g as string[])[0] : null);

              return (
                <Link
                  key={c.id}
                  href={`/case-studies/${c.id}`}
                  className="card-article stagger-fade"
                  style={{ padding: "1.5rem", border: "1px solid var(--border-light)" }}
                >
                  {coverImg && (
                    <div className="case-cover">
                      <img src={coverImg} alt={c.title} loading="lazy" />
                    </div>
                  )}
                  <div className="card-meta">
                    {[c.location, c.year].filter(Boolean).join(" · ")}
                  </div>
                  <h3>{c.title}</h3>
                  {c.architect && <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>{c.architect}</p>}
                  {uniqueStones.length > 0 && (
                    <div className="case-swatches">
                      {uniqueStones.slice(0, 5).map((s) => {
                        const img = Array.isArray(s.g) ? (s.g as string[])[0] : null;
                        return img ? (
                          <div className="case-swatch" key={s.id} title={s.n}>
                            <img src={img} alt={s.n} loading="lazy" />
                          </div>
                        ) : null;
                      })}
                    </div>
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
