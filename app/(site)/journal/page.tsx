import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { tf, FALLBACK_BG, rich } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.journal") };
}

export default async function JournalPage() {
  const { t, locale } = await getT();
  const posts = await prisma.post.findMany();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("journal.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("journal.hero_title"))} />
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="grid-3">
            {posts.map((a) => (
              <Link
                key={a.id}
                href={`/journal/${a.id}`}
                className="card-article stagger-fade"
              >
                <div className="card-img">
                  {a.img ? (
                    <img src={a.img} alt="" loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: FALLBACK_BG }} />
                  )}
                </div>
                <div className="card-meta">
                  {tf(a, "c", locale)} · {a.r} · {a.dt}
                </div>
                <h3>{tf(a, "t", locale)}</h3>
                <p>{tf(a, "e", locale)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
