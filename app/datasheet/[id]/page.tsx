import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { STANDARD_SIZES, svgPlaceholder } from "@/lib/catalogue";
import {
  MOHS_MAP, SLIP_BY_TYPE, LIMIT_ABBR, DS_APP_MATRIX, appClass,
  densityLbs, strengthPsi, absClassKey,
} from "@/lib/datasheet";
import PrintLoader from "@/components/PrintLoader";
import { datasheetCss } from "./datasheet-css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await prisma.stone.findUnique({ where: { id }, select: { n: true } });
  return { title: s ? `${s.n} — Datasheet` : "Datasheet" };
}

const inch = (cm: number) => Math.round(cm / 2.54);

export default async function DatasheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const s = await prisma.stone.findUnique({ where: { id } });
  if (!s) notFound();

  const type = s.ty || "Marble";
  const abbr = LIMIT_ABBR[type] || "marble";
  const g = Array.isArray(s.g) ? (s.g as string[]) : [];
  const img = (i: number) => g[i] || svgPlaceholder(s);

  const sizeList = (arr: { w: number; h: number }[]) =>
    arr.map((sz) => (
      <span className="ds-fmt-item" key={`${sz.w}x${sz.h}`}>
        {sz.w}×{sz.h} cm ({inch(sz.w)}×{inch(sz.h)}″)
      </span>
    ));

  return (
    <div className="dsdoc">
      <style dangerouslySetInnerHTML={{ __html: datasheetCss }} />
      <PrintLoader
        locale={locale}
        imgSelector=".ds-page img"
        labels={{
          coverTitle: t("datasheet.loading_title"),
          preparing: t("datasheet.preparing"),
          loadingImages: t("datasheet.loading_images"),
          loadingStatus: t("catalogue.loading_status"),
          savePdf: t("datasheet.save_pdf"),
          close: t("datasheet.close"),
          ready: t("catalogue.ready"),
        }}
      />

      <div className="ds-page">
        <div className="ds-header">
          <div className="ds-brand">
            <img src="/assets/images/logo-dark.png" alt="DIJA" />
            <span>{t("datasheet.brand_name")}</span>
          </div>
          <span className="ds-label">{t("datasheet.title_label")}</span>
        </div>

        {/* Hero */}
        <div className="ds-hero">
          <div className="ds-hero-img"><img src={img(0)} alt={s.n} /></div>
          <div className="ds-hero-info">
            <h1>{s.n}</h1>
            <div className="ds-subtitle">{s.ty} · {s.c}</div>
            {s.d && <div className="ds-desc">{s.d}</div>}
            {s.no && <div className="ds-note">{s.no}</div>}
          </div>
        </div>

        {/* Identity stripe */}
        <div className="ds-stripe">
          <div className="ds-stripe-item"><div className="ds-stripe-label">{t("datasheet.stripe_type")}</div><div className="ds-stripe-value">{s.ty || "—"}</div></div>
          <div className="ds-stripe-item"><div className="ds-stripe-label">{t("datasheet.stripe_origin")}</div><div className="ds-stripe-value">{s.ci}, {s.r}</div></div>
          <div className="ds-stripe-item"><div className="ds-stripe-label">{t("datasheet.stripe_colour")}</div><div className="ds-stripe-value">{s.cn || "—"}</div></div>
          <div className="ds-stripe-item"><div className="ds-stripe-label">{t("datasheet.stripe_age")}</div><div className="ds-stripe-value">{s.age || "—"}</div></div>
        </div>

        {/* Technical specifications */}
        <div className="ds-section" style={{ padding: "0 18mm" }}>
          <div className="ds-section-title">{t("datasheet.specs_title")}</div>
          <table className="ds-specs"><tbody>
            <tr><td>{t("datasheet.spec_density")}</td><td>{s.density || "—"} <span className="ds-muted">({densityLbs(s.density)})</span></td></tr>
            <tr><td>{t("datasheet.spec_absorption")}</td><td>{s.absorption || "—"} <span className="ds-muted">— {t(absClassKey(s.absorption))} {t("datasheet.spec_porosity")}</span></td></tr>
            <tr><td>{t("datasheet.spec_strength")}</td><td>{s.strength || "—"} <span className="ds-muted">({strengthPsi(s.strength)})</span></td></tr>
            <tr><td>{t("datasheet.spec_slip")}</td><td>{SLIP_BY_TYPE[type] || "—"} <span className="ds-muted">— {t("datasheet.spec_slip_note")}</span></td></tr>
            <tr><td>{t("datasheet.spec_mohs")}</td><td>{MOHS_MAP[type] || "—"} <span className="ds-muted">({type})</span></td></tr>
          </tbody></table>
        </div>

        {/* Applications & limitations */}
        <div className="ds-section" style={{ padding: "0 18mm" }}>
          <div className="ds-section-title">{t("datasheet.apps_title")}</div>
          <div className="ds-app-grid">
            <div>
              <table className="ds-app-table"><tbody>
                {DS_APP_MATRIX.map((r) => {
                  const icon = r.row[type] || "—";
                  return (
                    <tr key={r.labelKey}>
                      <td><span className={`ds-app-icon ${appClass(icon)}`}>{icon}</span></td>
                      <td>{t(r.labelKey)}</td>
                    </tr>
                  );
                })}
              </tbody></table>
              <div style={{ fontSize: "6pt", color: "#999", marginTop: "0.3rem" }}>{t("datasheet.apps_legend")}</div>
            </div>
            <div>
              <dl className="ds-limits">
                {["chemical", "freeze", "heat", "stain", "slip", "maint"].map((facet) => {
                  const labelKey = `datasheet.limit_${facet === "slip" ? "slip" : facet}`;
                  const textKey = `datasheet.limit_${abbr}_${facet === "slip" ? "slip" : facet}`;
                  return (
                    <div key={facet}>
                      <dt>{t(labelKey)}</dt>
                      <dd>{t(textKey)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>

        {/* Formats (page 2) */}
        <div className="ds-section" style={{ padding: "6mm 18mm 0", pageBreakBefore: "always" }}>
          <div className="ds-section-title">{t("datasheet.formats_title")}</div>
          <div className="ds-formats">
            <div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_tiles")}</div><div className="ds-fmt-value">{sizeList(STANDARD_SIZES.Tiles)}</div></div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_large_tiles")}</div><div className="ds-fmt-value">{sizeList(STANDARD_SIZES.LargeTiles)}</div></div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_slabs")}</div><div className="ds-fmt-value">{sizeList(STANDARD_SIZES.Slabs)}</div></div>
            </div>
            <div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_custom")}</div><div className="ds-fmt-value">{t("datasheet.format_custom_desc")}</div></div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_thicknesses")}</div><div className="ds-fmt-value">{s.thicknesses || "—"}</div></div>
              <div className="ds-fmt-group"><div className="ds-fmt-label">{t("datasheet.format_finishes")}</div><div className="ds-fmt-value">{s.finishes || "—"}</div></div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="ds-section" style={{ padding: "0 18mm" }}>
          <div className="ds-section-title">{t("datasheet.gallery_title")}</div>
          <div className="ds-gallery">
            <img className="hero-view" src={img(1)} alt={s.n} />
            <div className="thumb-grid">
              <img src={img(2)} alt={s.n} />
              <img src={img(3)} alt={s.n} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="ds-section" style={{ padding: "0 18mm" }}>
          <div className="ds-section-title">{t("datasheet.notes_title")}</div>
          <div className="ds-note-lines">
            <hr className="ds-note-line" /><hr className="ds-note-line" /><hr className="ds-note-line" />
          </div>
        </div>

        <div className="ds-footer">
          <span>{t("datasheet.footer_address")}</span>
          <span>contact@dijastones.com · <a href="https://www.dijastones.com">dijastones.com</a></span>
        </div>
      </div>
    </div>
  );
}
