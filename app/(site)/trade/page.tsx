import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/seo";
import { rich } from "@/lib/lang";
import TradeForm, { type TradeLabels } from "@/components/TradeForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return pageMeta({ title: t("title.trade"), description: t("trade.hero_text"), path: "/trade" });
}

export default async function TradePage() {
  const { t } = await getT();

  const formKeys = [
    "step_about", "field_name", "field_name_ph", "field_email", "field_email_ph",
    "field_phone", "field_phone_ph", "field_company", "field_company_ph", "field_role",
    "role_select", "step_practice", "field_referral", "field_referral_ph", "field_values",
    "field_project", "field_project_ph", "step_requirements", "field_volume", "volume_select",
    "field_stone_interest", "field_stone_interest_ph", "field_notes", "field_notes_ph",
    "submit", "submitting", "success_title", "success_text", "success_contact",
  ];
  const L: TradeLabels = Object.fromEntries(formKeys.map((k) => [k, t(`trade.${k}`)]));

  const roles = [
    ["Architect", "role_architect"], ["Interior Designer", "role_designer"],
    ["General Contractor", "role_contractor"], ["Developer", "role_developer"],
    ["Stone Fabricator", "role_fabricator"], ["Landscape Architect", "role_landscape"],
    ["Procurement", "role_procurement"], ["Other", "role_other"],
  ].map(([v, k]) => ({ v, l: t(`trade.${k}`) }));

  const volumes = [
    ["Under 500 m²", "volume_under"], ["500–2,000 m²", "volume_mid"],
    ["2,000–5,000 m²", "volume_high"], ["5,000+ m²", "volume_max"],
  ].map(([v, k]) => ({ v, l: t(`trade.${k}`) }));

  const values = [
    ["Colour consistency", "value_colour"], ["Traceable origin", "value_origin"],
    ["Competitive pricing", "value_pricing"], ["Technical support", "value_support"],
    ["Sustainability", "value_sustainability"], ["Long-term partnership", "value_partnership"],
  ].map(([v, k]) => ({ v, l: t(`trade.${k}`) }));

  const criteria = [
    ["fa-gem", "integrity"], ["fa-eye", "transparency"], ["fa-hand", "craft"],
    ["fa-compass", "vision"], ["fa-scale-balanced", "quality"], ["fa-leaf", "sustainability"],
  ];
  const benefits = [
    ["fa-dollar-sign", "pricing"], ["fa-clock", "priority"], ["fa-user-tie", "manager"],
    ["fa-flask", "sampling"], ["fa-file-invoice", "credit"], ["fa-hard-hat", "support"],
  ];

  return (
    <>
      <section className="page-hero" id="top">
        <div className="container">
          <div className="hero-label">{t("trade.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("trade.hero_title"))} />
          <p>{t("trade.hero_text")}</p>
          <a href="#trade-form-section" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            {t("trade.hero_cta")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </a>
        </div>
      </section>

      <section className="section pt-0 reveal">
        <div className="container narrow">
          <div className="section-label">{t("trade.philosophy_label")}</div>
          <h2 {...rich(t("trade.philosophy_title"))} />
          <p className="text-large">{t("trade.philosophy_text")}</p>
          <p style={{ marginBottom: 0 }}>{t("trade.philosophy_text2")}</p>
        </div>
      </section>

      <section className="section section-dark bg-noise" id="trade-form-section">
        <div className="container narrow">
          <div className="section-label">{t("trade.form_label")}</div>
          <h2 {...rich(t("trade.form_title"))} />
          <p>{t("trade.form_text")}</p>
          <TradeForm L={L} roles={roles} volumes={volumes} values={values} />
        </div>
      </section>

      <section className="section section-mist reveal">
        <div className="container">
          <div className="section-label text-center">{t("trade.criteria_label")}</div>
          <h2 className="text-center" {...rich(t("trade.criteria_title"))} />
          <div className="trade-criteria-grid reveal-stagger">
            {criteria.map(([icon, key]) => (
              <div className="trade-criteria-card" key={key}>
                <div className="trade-criteria-icon">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <h3>{t(`trade.criteria_${key}`)}</h3>
                <p>{t(`trade.criteria_${key}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow">
          <div className="section-label">{t("trade.benefits_label")}</div>
          <h2 {...rich(t("trade.benefits_title"))} />
          <p className="text-large">{t("trade.benefits_text")}</p>
          <div className="trade-benefits-grid">
            {benefits.map(([icon, key]) => (
              <div className="trade-benefit-item" key={key}>
                <div className="trade-benefit-icon">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <div>
                  <h4>{t(`trade.benefit_${key}`)}</h4>
                  <p>{t(`trade.benefit_${key}_text`)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="stats" style={{ margin: "2rem 0" }}>
            <div className="stat">
              <span className="stat-num">500+</span>
              <span className="stat-label">{t("trade.stat_partners")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">47</span>
              <span className="stat-label">{t("trade.stat_countries")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">15%</span>
              <span className="stat-label">{t("trade.stat_savings")}</span>
            </div>
          </div>
          <h3 style={{ marginBottom: "1rem" }}>{t("trade.qualifies")}</h3>
          <ul className="list-bullet">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>{t(`trade.qualifies_${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow text-center">
          <div className="section-label">{t("trade.not_ready_label")}</div>
          <h2 {...rich(t("trade.not_ready_title"))} />
          <p className="text-large">{t("trade.not_ready_text")}</p>
          <Link href="/materials" className="btn btn-primary">
            {t("trade.not_ready_btn")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
