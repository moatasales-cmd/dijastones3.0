import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { stoneImg } from "@/lib/img";
import { FALLBACK_BG } from "@/lib/lang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const col = await prisma.collection.findUnique({ where: { id } });
  return { title: col ? col.n : "Collection" };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const col = await prisma.collection.findUnique({ where: { id } });
  if (!col) notFound();

  const all = await prisma.stone.findMany({
    select: { id: true, n: true, c: true, ci: true, g: true, col: true },
  });
  const colStones = all.filter(
    (s) => Array.isArray(s.col) && (s.col as string[]).includes(id)
  );

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/collections" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("collection.back")}
          </Link>
          <div className="hero-label">
            {t("collections.collection")} · {colStones.length}{" "}
            {t("collection.stones")}
          </div>
          <h1 className="hero-title">{col.n}</h1>
          <p>{col.d}</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <div className="grid-4">
            {colStones.map((s) => {
              const img = stoneImg(s);
              return (
                <Link
                  key={s.id}
                  href={`/materials/${s.id}`}
                  className="card-swatch stagger-fade"
                >
                  <div className="card-img">
                    {img ? (
                      <img src={img} alt="" loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: FALLBACK_BG }} />
                    )}
                    <span className="card-country">{s.c}</span>
                  </div>
                  <div className="card-body">
                    <h3>{s.n}</h3>
                    <span className="card-origin">
                      {s.ci}, {s.c}
                    </span>
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
