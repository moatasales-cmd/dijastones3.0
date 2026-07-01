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
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="card-project stagger-fade"
                >
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
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
