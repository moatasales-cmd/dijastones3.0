import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { tf, FALLBACK_BG, rich } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.projects") };
}

export default async function ProjectsPage() {
  const { t, locale } = await getT();
  const projects = await prisma.project.findMany();
  const articleIds = projects.map((p) => p.articleId).filter((v): v is string => !!v);
  const articles = articleIds.length
    ? await prisma.post.findMany({ where: { id: { in: articleIds } } })
    : [];
  const articleById = new Map(articles.map((a) => [a.id, a]));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("projects.back")}
          </Link>
          <div className="hero-label">{t("projects.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("projects.hero_title"))} />
          <p>{t("projects.hero_text")}</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="project-list">
            {projects.map((p) => {
              const cover = Array.isArray(p.g) ? (p.g as string[])[0] : null;
              const article = p.articleId ? articleById.get(p.articleId) : null;
              return (
                <div key={p.id} className="stagger-fade">
                  <Link href={`/projects/${p.id}`} className="card-project">
                    <div className="card-img">
                      {cover ? (
                        <img src={cover} alt="" loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: FALLBACK_BG }} />
                      )}
                    </div>
                    <div className="card-project-body">
                      <div className="card-meta">
                        {tf(p, "c", locale)} · {p.y}
                      </div>
                      <h2>{tf(p, "t", locale)}</h2>
                      <p>{tf(p, "b", locale)}</p>
                    </div>
                  </Link>
                  {article && (
                    <Link href={`/journal/${article.id}`} className="card-project-article-link">
                      <i className="fa-solid fa-book-open" /> {t("project.read_article")}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
