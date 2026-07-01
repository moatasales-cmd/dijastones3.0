import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("collections.title") };
}

export default async function CollectionsPage() {
  const { t } = await getT();
  const [collections, stones] = await Promise.all([
    prisma.collection.findMany(),
    prisma.stone.findMany({ select: { col: true } }),
  ]);

  const countFor = (id: string) =>
    stones.filter(
      (s) => Array.isArray(s.col) && (s.col as string[]).includes(id)
    ).length;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("collections.back")}
          </Link>
          <div className="hero-label">{t("collections.title")}</div>
          <h1 className="hero-title" {...rich(t("collections.hero_title"))} />
          <p>{t("collections.hero_text")}</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="grid-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="card-collection stagger-fade"
              >
                <div className="card-img">
                  <img src={col.cov ?? ""} alt={col.n} loading="lazy" />
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    {t("collections.collection")} · {countFor(col.id)}{" "}
                    {t("collections.stones")}
                  </div>
                  <h3>{col.n}</h3>
                  <p>{col.d}</p>
                  <span className="link-arrow">{t("collections.enter")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
