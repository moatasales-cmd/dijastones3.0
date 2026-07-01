import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/lang";
import {
  TYPE_ORDER, STANDARD_SIZES, TYPE_NAMES_MATRIX, APP_MATRIX, COUNTRY_REGIONS, svgPlaceholder,
} from "@/lib/catalogue";
import PrintLoader from "@/components/PrintLoader";
import { catalogueCss } from "./catalogue-css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("catalogue.title") };
}

type Stone = Awaited<ReturnType<typeof prisma.stone.findMany>>[number];

const inch = (cm: number) => Math.round(cm / 2.54);

export default async function CataloguePage() {
  const { t, locale } = await getT();
  const stones = await prisma.stone.findMany();

  // Group by type in the canonical order, each sorted by name.
  const byType: Record<string, Stone[]> = {};
  for (const s of stones) {
    const ty = s.ty || "Other";
    (byType[ty] ||= []).push(s);
  }
  const orderedTypes = [
    ...TYPE_ORDER.filter((t2) => byType[t2]?.length),
    ...Object.keys(byType).filter((t2) => !TYPE_ORDER.includes(t2)),
  ];
  for (const ty of orderedTypes) byType[ty].sort((a, b) => a.n.localeCompare(b.n));

  // Pre-compute page numbers for the contents index.
  const sectionPage: Record<string, number> = {};
  const indexList: { name: string; origin: string; type: string; page: number }[] = [];
  let next = 5; // cover=1, why=2, about=3, index=4
  for (const ty of orderedTypes) {
    sectionPage[ty] = next++;
    for (const s of byType[ty]) {
      indexList.push({ name: s.n, origin: s.c, type: ty, page: next++ });
    }
  }

  const countryCounts: Record<string, number> = {};
  for (const s of stones) countryCounts[s.c] = (countryCounts[s.c] || 0) + 1;
  const sortedCountries = Object.keys(countryCounts).sort();

  const gimg = (s: Stone, i: number) => {
    const g = Array.isArray(s.g) ? (s.g as string[]) : [];
    return g[i] || svgPlaceholder(s);
  };
  const year = new Date().getFullYear();

  const pages: React.ReactNode[] = [];
  let pageNum = 0;
  const footer = (label: React.ReactNode, right?: React.ReactNode) => (
    <div className="cat-ft">
      <span>{label}</span>
      <span>
        <span className="page-num">{pageNum}</span> · {right ?? "dijastones.com"}
      </span>
    </div>
  );

  // ── Cover ──
  pageNum++;
  pages.push(
    <div className="page page-cover" key="cover">
      <div className="cat-logo" style={{ position: "absolute", top: "30mm", left: 0, width: "100%", textAlign: "center" }}>
        <img src="/assets/images/logo-dark.png" alt={t("catalogue.cover_title")} />
      </div>
      <h1 style={{ marginTop: "2rem" }}>{t("catalogue.cover_title")}</h1>
      <div className="subtitle">{t("catalogue.cover_subtitle")}</div>
      <div className="line" />
      <div className="meta">{year}<span>{t("catalogue.cover_tagline")}</span></div>
      <div className="cover-stat">{t("catalogue.cover_stats_all", stones.length, orderedTypes.length)}</div>
      <div className="cover-badges">
        {orderedTypes.map((ty) => <span key={ty}>{ty}</span>)}
      </div>
      <div className="footer-text">{t("catalogue.cover_footer")}</div>
    </div>
  );

  // ── Why DIJA ──
  pageNum++;
  pages.push(
    <div className="page page-why-dija" key="why">
      <div className="cat-lbl">{t("catalogue.page_label", pageNum)}</div>
      <h2>{t("catalogue.why_dija_title")}</h2>
      <div className="accent-line" />
      <p {...rich(t("catalogue.why_dija_p1"))} />
      <p {...rich(t("catalogue.why_dija_p2"))} />
      <p {...rich(t("catalogue.why_dija_p3"))} />
      <p {...rich(t("catalogue.why_dija_p4"))} />
      <div className="signoff" {...rich(t("catalogue.why_dija_signoff"))} />
      <div className="cat-ft" style={{ position: "absolute", bottom: "15mm", left: "25mm", right: "25mm" }}>
        <span>{t("catalogue.why_dija_footer")}</span>
        <span><span className="page-num">{pageNum}</span> · dijastones.com</span>
      </div>
    </div>
  );

  // ── About ──
  pageNum++;
  pages.push(
    <div className="page page-about" key="about">
      <div className="page-inner">
        <div className="cat-hd"><span className="brand-name">{t("catalogue.cover_title")}</span><span className="page-label">{t("catalogue.about_label")}</span></div>
        <h2>{t("catalogue.about_title")}</h2>
        <div className="accent-line" />
        <p {...rich(t("catalogue.about_p1"))} />
        <p {...rich(t("catalogue.about_p2"))} />
        <div className="values">
          {[1, 2, 3, 4].map((i) => (
            <div className="val" key={i}>
              <div className="val-title">{t(`catalogue.about_val${i}_title`)}</div>
              <div className="val-desc" {...rich(t(`catalogue.about_val${i}_desc`))} />
            </div>
          ))}
        </div>
        <div className="facts">
          <div className="fact"><div className="fact-num">{stones.length}</div><div className="fact-label">{t("catalogue.about_fact_stones")}</div></div>
          <div className="fact"><div className="fact-num">10</div><div className="fact-label">{t("catalogue.about_fact_countries")}</div></div>
          <div className="fact"><div className="fact-num">{orderedTypes.length}</div><div className="fact-label">{t("catalogue.about_fact_types")}</div></div>
          <div className="fact"><div className="fact-num">5</div><div className="fact-label">{t("catalogue.about_fact_offices")}</div></div>
        </div>
        <div className="contact">
          <div><strong>{t("catalogue.about_hq")}</strong><br />10031 Sok. No: 14, AOSB, Cigli 35620<br />Izmir, Türkiye</div>
          <div><strong>{t("catalogue.about_contact")}</strong><br />+90 232 556 12 00<br />contact@dijastones.com</div>
          <div><strong>{t("catalogue.about_offices")}</strong><br />Izmir · Tunis · Doha · Rome · Quebec</div>
          <div><strong>{t("catalogue.about_web")}</strong><br />www.dijastones.com</div>
        </div>
        {footer(<span {...rich(t("catalogue.footer_brand"))} />)}
      </div>
    </div>
  );

  // ── Index / Contents ──
  pageNum++;
  pages.push(
    <div className="page page-index" key="index">
      <div className="page-inner">
        <div className="cat-hd"><span className="brand-name">DIJA Natural Stone</span><span className="page-label">{t("catalogue.contents_label")}</span></div>
        <h2>{t("catalogue.contents_title")}</h2>
        <div className="accent-line" />
        <div className="index-content">
          <div style={{ marginBottom: "0.5rem", fontSize: "7.5pt", color: "#8a8a8a", lineHeight: 1.6 }}>
            {t("catalogue.contents_why_dija")}<br />{t("catalogue.contents_about_dija")}
          </div>
          {orderedTypes.map((ty, i) => (
            <div key={ty}>
              <div className="index-section-title">{i + 1}. {ty} · page {sectionPage[ty]}</div>
              {indexList.filter((e) => e.type === ty).map((e) => (
                <div className="index-entry" key={e.name}>
                  <span className="entry-name">{e.name} <span style={{ color: "#8a8a8a" }}>({e.origin})</span></span>
                  <span className="entry-page">p. {e.page}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {footer("DIJA Marble — Izmir, Türkiye")}
      </div>
    </div>
  );

  // ── Type sections + product pages ──
  let sectionIdx = 0;
  for (const ty of orderedTypes) {
    sectionIdx++;
    const list = byType[ty];
    pageNum++;
    pages.push(
      <div className="page page-section" key={`sec-${ty}`}>
        <div className="section-num">{t("catalogue.section_label", sectionIdx)}</div>
        <h2>{ty}</h2>
        <div className="section-line" />
        <p {...rich(t(`catalogue.type_${ty.toLowerCase()}_desc`))} />
        <div className="section-grid">
          <div><div className="sg-label">{t("catalogue.section_best")}</div><div className="sg-val">{t(`catalogue.${ty.toLowerCase()}_best`)}</div></div>
          <div><div className="sg-label">{t("catalogue.section_consider")}</div><div className="sg-val">{t(`catalogue.${ty.toLowerCase()}_consider`)}</div></div>
          <div><div className="sg-label" {...rich(t("catalogue.section_care"))} /><div className="sg-val">{t(`catalogue.${ty.toLowerCase()}_care`)}</div></div>
        </div>
        <div className="count">{list.length} {ty}{list.length !== 1 ? "s" : ""}</div>
        <div className="cat-ft" style={{ position: "absolute", bottom: "15mm", left: "18mm", right: "18mm" }}>
          <span>{ty}</span><span><span className="page-num">{pageNum}</span> · dijastones.com</span>
        </div>
      </div>
    );

    for (const s of list) {
      pageNum++;
      const tyl = (s.ty || "").toLowerCase();
      const specs: [React.ReactNode, string | null][] = [
        [t("catalogue.spec_finishes"), t(`catalogue.${tyl}_finishes`)],
        [t("catalogue.spec_best"), s.applications || t(`catalogue.${tyl}_apps`)],
        s.strength ? [t("catalogue.spec_strength"), s.strength] : null,
        s.absorption ? [t("catalogue.spec_absorption"), s.absorption] : null,
        s.density ? [t("catalogue.spec_density"), s.density] : null,
        s.age ? [t("catalogue.spec_age"), s.age] : null,
      ].filter(Boolean) as [React.ReactNode, string | null][];

      pages.push(
        <div className="page page-product" key={s.id}>
          <div className="page-inner">
            <div className="cat-hd"><span className="brand-name">{t("catalogue.cover_title")}</span><span className="page-label">{s.ty} · {s.c}</span></div>
            <div className="product-grid">
              <div className="product-image"><img src={gimg(s, 0)} alt={s.n} /></div>
              <div className="product-info">
                <h2>{s.n}</h2>
                <div className="origin">{s.ci}, {s.c} · {s.cn}</div>
                <div className="thickness-line">10 mm · 20 mm · 30 mm</div>
                {s.d && <div className="desc">{s.d}</div>}
                {s.no && <div className="note">{s.no}</div>}
                <table className="specs"><tbody>
                  {specs.map(([label, val], i) => (
                    <tr key={i}><td>{label}</td><td>{val || "—"}</td></tr>
                  ))}
                </tbody></table>
                <div className="sizes-section">
                  <div className="sizes-cols">
                    <div className="sizes-col">
                      <div className="sizes-col-title">{t("catalogue.sizes_tiles")}</div>
                      {STANDARD_SIZES.Tiles.map((sz, i) => (
                        <div className="sizes-col-item" key={i}>{sz.w}×{sz.h} cm ({inch(sz.w)}×{inch(sz.h)}″)</div>
                      ))}
                    </div>
                    <div className="sizes-col">
                      <div className="sizes-col-title">{t("catalogue.sizes_large_tiles")}</div>
                      {STANDARD_SIZES.LargeTiles.map((sz, i) => (
                        <div className="sizes-col-item" key={i}>{sz.w}×{sz.h} cm ({inch(sz.w)}×{inch(sz.h)}″)</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="sizes-inline-title">{t("catalogue.sizes_slabs")}</span>{" "}
                    <span className="sizes-inline">{STANDARD_SIZES.Slabs.map((sz) => `${sz.w}×${sz.h} cm (${inch(sz.w)}×${inch(sz.h)}″)`).join(" · ")}</span>
                  </div>
                </div>
                <div className="stone-architect-note">{t(`catalogue.${tyl}_note`)}</div>
              </div>
            </div>
            <div className="product-thumbs">
              <div className="product-thumb"><img src={gimg(s, 1)} alt="" /></div>
              <div className="product-thumb"><img src={gimg(s, 2)} alt="" /></div>
            </div>
            {footer(<span {...rich(t("catalogue.footer_brand"))} />, s.n)}
          </div>
        </div>
      );
    }
  }

  // ── Reference: Application Suitability Matrix ──
  pageNum++;
  pages.push(
    <div className="page page-ref" key="ref-app">
      <div className="page-inner">
        <div className="cat-hd"><span className="brand-name">{t("catalogue.cover_title")}</span><span className="page-label">{t("catalogue.ref_label")}</span></div>
        <h2>{t("catalogue.ref_app_title")}</h2>
        <div className="ref-line" />
        <p className="ref-lead" {...rich(t("catalogue.ref_app_lead", stones.length))} />
        <table className="ref-matrix"><tbody>
          <tr><th style={{ width: "26%" }}>{t("catalogue.ref_app_col")}</th>{TYPE_NAMES_MATRIX.map((tn) => <th key={tn}>{tn}</th>)}</tr>
          {APP_MATRIX.map((r) => (
            <tr key={r.key}>
              <td>{t(r.key)}</td>
              {TYPE_NAMES_MATRIX.map((tn) => {
                const v = r.row[tn];
                return <td key={tn}><span className={v === "✓" ? "ref-icon-yes" : v === "⚠" ? "ref-icon-caution" : "ref-icon-no"}>{v}</span></td>;
              })}
            </tr>
          ))}
        </tbody></table>
        {footer(<span {...rich(t("catalogue.ref_app_footer"))} />)}
      </div>
    </div>
  );

  // ── Reference: Care & Maintenance ──
  pageNum++;
  pages.push(
    <div className="page page-ref" key="ref-care">
      <div className="page-inner">
        <div className="cat-hd"><span className="brand-name">{t("catalogue.cover_title")}</span><span className="page-label">{t("catalogue.ref_label")}</span></div>
        <h2 {...rich(t("catalogue.ref_care_title"))} />
        <div className="ref-line" />
        <p className="ref-lead">{t("catalogue.ref_care_lead")}</p>
        <div className="ref-grid-3">
          {[1, 2, 3].map((i) => (
            <div className="ref-card" key={i}>
              <div className="ref-card-title">{t(`catalogue.ref_care_card${i}_title`)}</div>
              <div className="ref-card-text" {...rich(t(`catalogue.ref_care_card${i}_text`))} />
            </div>
          ))}
        </div>
        <div className="ref-grid-3" style={{ marginTop: "0.5rem" }}>
          {["Marble", "Onyx", "Limestone", "Travertine", "Granite", "Quartzite"].map((ct) => (
            <div className="ref-card" key={ct}>
              <div className="ref-card-title">{ct}</div>
              <div className="ref-card-text">{t(`catalogue.${ct.toLowerCase()}_care`)}</div>
            </div>
          ))}
        </div>
        {footer(<span {...rich(t("catalogue.ref_care_footer"))} />)}
      </div>
    </div>
  );

  // ── Reference: Sourcing & Global Reach ──
  pageNum++;
  pages.push(
    <div className="page page-ref" key="ref-src">
      <div className="page-inner">
        <div className="cat-hd"><span className="brand-name">{t("catalogue.cover_title")}</span><span className="page-label">{t("catalogue.ref_label")}</span></div>
        <h2 {...rich(t("catalogue.ref_sourcing_title"))} />
        <div className="ref-line" />
        <p className="ref-lead">{t("catalogue.ref_sourcing_lead")}</p>
        <div className="ref-stats-grid">
          <div><div className="ref-stat-num">{stones.length}</div><div className="ref-stat-label">{t("catalogue.about_fact_stones")}</div></div>
          <div><div className="ref-stat-num">10</div><div className="ref-stat-label">{t("catalogue.about_fact_countries")}</div></div>
          <div><div className="ref-stat-num">{orderedTypes.length}</div><div className="ref-stat-label">{t("catalogue.about_fact_types")}</div></div>
          <div><div className="ref-stat-num">5</div><div className="ref-stat-label">{t("catalogue.about_fact_offices")}</div></div>
          <div><div className="ref-stat-num">3</div><div className="ref-stat-label">{t("catalogue.ref_continents")}</div></div>
        </div>
        <table className="ref-table"><tbody>
          <tr><th style={{ width: "35%" }}>{t("catalogue.ref_country")}</th><th style={{ width: "45%" }}>{t("catalogue.ref_regions")}</th><th style={{ width: "20%", textAlign: "center" }}>{t("catalogue.ref_stones_header")}</th></tr>
          {sortedCountries.map((co) => (
            <tr key={co}><td><strong>{co}</strong></td><td>{COUNTRY_REGIONS[co] || ""}</td><td style={{ textAlign: "center" }}>{countryCounts[co]}</td></tr>
          ))}
        </tbody></table>
        {footer(<span {...rich(t("catalogue.ref_sourcing_footer"))} />)}
      </div>
    </div>
  );

  // ── Back cover ──
  pages.push(
    <div className="page page-back" key="back">
      <div className="cat-logo"><img src="/assets/images/logo-dark.png" alt={t("catalogue.cover_title")} /></div>
      <div className="back-line" />
      <div className="back-info">
        <strong>{t("catalogue.back.company_name")}</strong><br />
        10031 Sok. No: 14, AOSB, Cigli 35620 — Izmir, Türkiye<br />
        +90 232 556 12 00 · contact@dijastones.com<br /><br />
        <a href="https://www.dijastones.com" style={{ color: "#915D36" }}>www.dijastones.com</a>
      </div>
    </div>
  );

  return (
    <div className="catdoc">
      <style dangerouslySetInnerHTML={{ __html: catalogueCss }} />
      <PrintLoader
        locale={locale}
        labels={{
          coverTitle: t("catalogue.cover_title"),
          preparing: t("catalogue.preparing"),
          loadingImages: t("catalogue.loading_images"),
          loadingStatus: t("catalogue.loading_status"),
          savePdf: t("catalogue.save_pdf"),
          close: t("catalogue.close"),
          ready: t("catalogue.ready"),
        }}
      />
      {pages}
    </div>
  );
}
