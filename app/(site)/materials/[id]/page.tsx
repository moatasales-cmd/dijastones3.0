import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { stoneImg } from "@/lib/img";
import { SITE_URL } from "@/lib/site";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import Gallery from "@/components/Gallery";
import PriceSection from "@/components/PriceSection";
import FavoriteButton from "@/components/FavoriteButton";
import QuoteModal from "@/components/QuoteModal";
import CompareButton from "@/components/CompareButton";
import JsonLd from "@/components/JsonLd";
import MaterialCard, { type CardLabels } from "@/components/MaterialCard";

const CARD_FIELDS = {
  id: true,
  n: true,
  c: true,
  ci: true,
  ty: true,
  to: true,
  cn: true,
  p: true,
  pPremium: true,
  g: true,
  dm: true,
} as const;

async function getStone(id: string) {
  return prisma.stone.findUnique({ where: { id } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await getStone(id);
  if (!s) return { title: "Material" };
  const img = stoneImg(s);
  // Title formula (SEO-PLAN Part 3.2): name + type + buyer words. The layout
  // template appends "— DIJA Natural Stone" as the brand.
  const title = [s.n, s.ty ? `${s.ty} Slabs & Tiles, Price & Supplier` : "Price & Supplier"]
    .filter(Boolean)
    .join(" — ");
  const origin = [s.ci, s.c].filter(Boolean).join(", ");
  const priceBit = s.p != null ? ` From $${s.p}/m² ex-works.` : "";
  const description =
    (s.d ? `${s.d} ` : "") +
    `${s.n}${s.ty ? ` ${s.ty.toLowerCase()}` : ""}${origin ? ` from ${origin}` : ""} — wholesale slabs, tiles and cut-to-size, exported worldwide by DIJA.${priceBit}`;
  return pageMeta({
    title,
    description,
    path: `/materials/${s.id}`,
    ogImage: img,
  });
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const s = await getStone(id);
  if (!s) notFound();

  const isDolomitic = s.dm;

  const images = (Array.isArray(s.g) ? (s.g as string[]) : []).filter(Boolean);

  // Related: up to 4, same type first then same tone.
  const pool = await prisma.stone.findMany({
    where: { id: { not: id }, OR: [{ ty: s.ty }, { to: s.to }] },
    select: CARD_FIELDS,
    take: 24,
  });
  const sameType = pool.filter((x) => x.ty === s.ty).slice(0, 4);
  const sameTone = pool.filter((x) => x.to === s.to && x.ty !== s.ty).slice(0, 4);
  const seen = new Set<string>();
  const related = [...sameType, ...sameTone]
    .filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)))
    .slice(0, 4);

  const cardLabels: CardLabels = {
    from: t("materials.from"),
    premium: t("materials.premium"),
    exworks: t("materials.exworks_label"),
    exworksTitle: t("materials.exworks_title"),
    addFavorite: t("materials.add_favorite"),
  };

  const collections =
    Array.isArray(s.col) && s.col.length
      ? await prisma.collection.findMany({
          where: { id: { in: s.col as string[] } },
          select: { id: true, n: true },
        })
      : [];

  // Case studies that reference this stone (materials is a JSON column, so
  // filter in JS — 113 small rows). Internal links both ways: the case study
  // already links here; this closes the loop for visitors and crawlers.
  const allCases = await prisma.caseStudy.findMany({
    select: { id: true, title: true, location: true, materials: true },
  });
  const seenIn = allCases
    .filter((c) =>
      Array.isArray(c.materials) &&
      (c.materials as { stoneId?: string | null }[]).some((m) => m.stoneId === s.id)
    )
    .slice(0, 6);

  const specs: [string, string | null][] = [
    [t("material.sizes"), s.sizes],
    [t("material.thicknesses"), s.thicknesses],
    [t("material.finishes"), s.finishes],
    [t("material.applications"), s.applications],
    [t("material.water_absorption"), s.absorption],
    [t("material.density"), s.density],
    [t("material.compressive_strength"), s.strength],
    [t("material.slip_resistance"), s.slip],
    [t("material.geological_age"), s.age],
  ];

  const img = stoneImg(s);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: s.n,
    description: s.d || undefined,
    image: img ? `${SITE_URL}${img}` : undefined,
    category: s.ty || undefined,
    brand: { "@type": "Brand", name: "DIJA" },
    countryOfOrigin: s.c || undefined,
    url: `${SITE_URL}/materials/${s.id}`,
    ...(s.p != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: s.p,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/materials/${s.id}`,
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={productLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: t("material.breadcrumb_materials"), path: "/materials" },
          { name: s.n, path: `/materials/${s.id}` },
        ])}
      />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs">
            <Link href="/materials">{t("material.breadcrumb_materials")}</Link>
            <span className="bc-sep">›</span>
            <span>{s.ty}</span>
            <span className="bc-sep">›</span>
            <span>{s.n}</span>
          </nav>
          <div className="hero-title-wrap">
            <h1 className="hero-title">{s.n}</h1>
            <FavoriteButton stoneId={s.id} title={t("materials.add_favorite")} large />
            <CompareButton stoneId={s.id} stoneName={s.n} />
          </div>
          <p>
            {s.ty}
            {isDolomitic && (
              <>
                {" "}
                <span className="mat-detail-dolomite">{t("catalogue.product.dolomite")}</span>
              </>
            )}{" "}
            · {s.c} · {s.ci}
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="detail-grid">
            <Gallery images={images} alt={s.n} />

            <div className="detail-info">
              {s.d && <p className="detail-desc">{s.d}</p>}
              {s.no && (
                <div className="detail-note">
                  <i className="fa-solid fa-quote-left" /> {s.no}
                </div>
              )}

              {s.p != null && (
                <PriceSection
                  p={s.p}
                  pPremium={s.pPremium}
                  labels={{
                    pricing: t("material.pricing"),
                    standardGrade: t("material.standard_grade"),
                    premiumGrade: t("material.premium_grade"),
                    priceNote: t("material.price_note"),
                    contactUs: t("material.contact_us"),
                    priceNote2: t("material.price_note2"),
                  }}
                />
              )}

              {collections.length > 0 && (
                <div className="mat-collections">
                  <h3>
                    <i className="fa-solid fa-layer-group" /> {t("material.part_of")}
                  </h3>
                  <div className="mat-col-badges">
                    {collections.map((c) => (
                      <Link
                        key={c.id}
                        href={`/collections/${c.id}`}
                        className="mat-col-badge"
                      >
                        {c.n}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {seenIn.length > 0 && (
                <div className="mat-collections">
                  <h3>
                    <i className="fa-solid fa-building-columns" /> {t("material.seen_in_projects")}
                  </h3>
                  <div className="mat-col-badges">
                    {seenIn.map((c) => (
                      <Link
                        key={c.id}
                        href={`/case-studies/${c.id}`}
                        className="mat-col-badge"
                      >
                        {c.title}
                        {c.location ? ` · ${c.location}` : ""}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-specs">
                <div className="spec">
                  <span className="spec-label">{t("material.origin")}</span>
                  <span className="spec-val">
                    {s.ci}, {s.c}
                  </span>
                </div>
                <div className="spec">
                  <span className="spec-label">{t("material.type")}</span>
                  <span className="spec-val">{s.ty}</span>
                </div>
                <div className="spec">
                  <span className="spec-label">{t("material.country")}</span>
                  <span className="spec-val">{s.c}</span>
                </div>
                <div className="spec">
                  <span className="spec-label">{t("material.color")}</span>
                  <span className="spec-val">{s.cn}</span>
                </div>
              </div>

              <div className="tech-sheet">
                <h3>
                  <i className="fa-solid fa-clipboard-list" />{" "}
                  {t("material.technical_specs")}
                </h3>
                <div className="tech-grid">
                  {specs.map(([label, val]) => (
                    <div className="tech-item" key={label}>
                      <span className="tech-label">{label}</span>
                      <span className="tech-val">{val || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-btns">
                <QuoteModal
                  stoneId={s.id}
                  stoneName={s.n}
                  labels={{
                    requestQuote: t("material.request_quote"),
                    name: t("material.quote_name"),
                    namePh: t("material.quote_name_ph"),
                    email: t("material.quote_email"),
                    emailPh: t("material.quote_email_ph"),
                    phone: t("material.quote_phone"),
                    phonePh: t("material.quote_phone_ph"),
                    area: t("material.quote_area"),
                    areaPh: t("material.quote_area_ph"),
                    message: t("material.quote_message"),
                    messagePh: t("material.quote_message_ph"),
                    submit: t("material.quote_submit"),
                    sending: t("material.quote_sending"),
                    close: t("lightbox.close"),
                  }}
                />
                <a
                  href={`/datasheet/${encodeURIComponent(s.id)}`}
                  className="detail-btn"
                  target="_blank"
                >
                  <i className="fa-solid fa-download" /> {t("material.datasheet")}
                </a>
              </div>
            </div>
          </div>

          {related.length >= 2 && (
            <div className="mat-related">
              <h2>{t("material.related_title")}</h2>
              <div className="grid-4">
                {related.map((rs) => (
                  <MaterialCard
                    key={rs.id}
                    stone={rs}
                    unit="sqm"
                    labels={cardLabels}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
