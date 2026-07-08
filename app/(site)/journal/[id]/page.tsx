import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { pageMeta, articleLd, translatedLocales } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { tf, tfArr, FALLBACK_BG } from "@/lib/lang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { locale } = await getT();
  const a = await prisma.post.findUnique({ where: { id } });
  if (!a) return { title: "Journal" };
  return pageMeta({
    title: tf(a, "t", locale),
    description: tf(a, "e", locale) || undefined,
    path: `/journal/${a.id}`,
    ogImage: a.img,
    ogType: "article",
    // The article body is the content — only advertise locales that have it.
    langAlternates: translatedLocales(a, ["b"]),
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const a = await prisma.post.findUnique({ where: { id } });
  if (!a) notFound();

  const relatedProject = await prisma.project.findFirst({ where: { articleId: id } });
  const relatedCaseStudy = await prisma.caseStudy.findFirst({ where: { articleId: id } });
  const body = tfArr(a, "b", locale);

  return (
    <>
      <JsonLd
        data={articleLd({
          title: tf(a, "t", locale),
          description: tf(a, "e", locale),
          path: `/journal/${a.id}`,
          image: a.img,
          author: a.a,
          datePublished: a.dt,
        })}
      />
      <section className="page-hero">
        <div className="container">
          <Link href="/journal" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("article.back")}
          </Link>
          <div className="hero-label">
            {tf(a, "c", locale)} · {a.r} · {a.dt}
          </div>
          <h1 className="hero-title">{tf(a, "t", locale)}</h1>
          <p>{t("article.by", a.a ?? "")}</p>
        </div>
      </section>
      <article className="section pt-0 article-page">
        <div className="container narrow">
          <div className="article-img">
            {a.img ? (
              <img src={a.img} alt="" />
            ) : (
              <div style={{ width: "100%", aspectRatio: "16/9", background: FALLBACK_BG }} />
            )}
          </div>
          <div className="article-body">
            {body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {relatedProject && (
            <Link
              href={`/projects/${relatedProject.id}`}
              className="pf-btn pf-btn-ghost"
              style={{ marginTop: "1.5rem" }}
            >
              <i className="fa-solid fa-diagram-project" /> {t("journal.view_project")}: {tf(relatedProject, "t", locale)}
            </Link>
          )}
          {relatedCaseStudy && (
            <Link
              href={`/case-studies/${relatedCaseStudy.id}`}
              className="pf-btn pf-btn-ghost"
              style={{ marginTop: "1.5rem" }}
            >
              <i className="fa-solid fa-gem" /> {t("journal.view_case_study")}: {relatedCaseStudy.title}
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
