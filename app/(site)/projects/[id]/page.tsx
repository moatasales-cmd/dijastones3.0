import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { tf, tfArr, FALLBACK_BG } from "@/lib/lang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { locale } = await getT();
  const p = await prisma.project.findUnique({ where: { id } });
  return { title: p ? tf(p, "t", locale) : "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) notFound();

  const g = Array.isArray(p.g) ? (p.g as string[]) : [];
  const cover = g[0] ?? null;
  const thumbs = g.slice(1, 7);
  const story = tfArr(p, "bo", locale);
  const quote = tf(p, "q", locale);

  const specs: [string, string | null][] = [
    [t("project.spec_architect"), p.a],
    [t("project.spec_location"), p.l],
    [t("project.spec_stone"), p.st],
    [t("project.spec_tonnage"), p.to],
    [t("project.spec_panels"), p.p],
    [t("project.spec_duration"), p.d],
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/projects" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("project.back")}
          </Link>
          <div className="hero-label">
            {tf(p, "c", locale)} · {p.y}
          </div>
          <h1 className="hero-title">{tf(p, "t", locale)}</h1>
          <p>
            {p.l} · {p.a}
          </p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="detail-grid">
            <div>
              <div className="detail-main-img">
                {cover ? (
                  <img src={cover} alt="" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: FALLBACK_BG }} />
                )}
              </div>
              {thumbs.length > 0 && (
                <div className="detail-thumbs">
                  {thumbs.map((ti, i) => (
                    <img key={i} src={ti} alt="" loading="lazy" />
                  ))}
                </div>
              )}
            </div>
            <div className="detail-info">
              <div className="detail-specs">
                {specs.map(([label, val]) => (
                  <div className="spec" key={label}>
                    <span className="spec-label">{label}</span>
                    <span className="spec-val">{val}</span>
                  </div>
                ))}
              </div>
              <div className="detail-story">
                <div className="card-meta">{t("project.story")}</div>
                {story.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {quote && (
                <div className="detail-quote">
                  <p>{quote}</p>
                  <span>— {tf(p, "qb", locale)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
