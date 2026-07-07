import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/seo";
import { rich } from "@/lib/lang";
import Pillars, { type Pillar } from "@/components/Pillars";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return pageMeta({ title: t("title.sustainability"), description: t("sustainability.hero_text"), path: "/sustainability" });
}

export default async function SustainabilityPage() {
  const { t } = await getT();

  const stats = [
    { num: "92%", desc: t("sustainability.stat_92") },
    { num: "100%", desc: t("sustainability.stat_100") },
    { num: "30+", desc: t("sustainability.stat_30") },
  ];

  const pillars: Pillar[] = [
    { icon: "fa-solid fa-leaf", title: t("sustainability.pillar_carbon"), text: t("sustainability.pillar_carbon_text"), target: t("sustainability.pillar_carbon_target") },
    { icon: "fa-solid fa-droplet", title: t("sustainability.pillar_water"), text: t("sustainability.pillar_water_text"), target: t("sustainability.pillar_water_target") },
    { icon: "fa-solid fa-rotate", title: t("sustainability.pillar_waste"), text: t("sustainability.pillar_waste_text"), target: t("sustainability.pillar_waste_target") },
    { icon: "fa-solid fa-handshake", title: t("sustainability.pillar_community"), text: t("sustainability.pillar_community_text"), target: t("sustainability.pillar_community_target") },
  ];

  const steps = ["source", "cut", "finish", "ship", "return"];
  const milestones = ["2015", "2018", "2020", "2022", "2024", "2026"];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("sustainability.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("sustainability.hero_title"))} />
          <p>{t("sustainability.hero_text")}</p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="grid-3 reveal-stagger">
            {stats.map((s) => (
              <div className="sust-card" key={s.num}>
                <span className="stat-num">{s.num}</span>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sust-banner reveal">
        <div
          className="sust-banner-bg"
          style={{ backgroundImage: "url(/assets/images/hero-bg.webp)" }}
        />
        <div className="sust-banner-overlay" />
        <div className="sust-banner-content">
          <div className="section-label">{t("sustainability.philosophy_label")}</div>
          <h2 {...rich(t("sustainability.philosophy_title"))} />
          <p>{t("sustainability.philosophy_text")}</p>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-label text-center">{t("sustainability.pillars_label")}</div>
          <h2 className="text-center" {...rich(t("sustainability.pillars_title"))} />
          <Pillars pillars={pillars} targetLabel={t("sustainability.target")} />
        </div>
      </section>

      <section className="section section-dark bg-noise reveal">
        <div className="container">
          <div className="section-label">{t("sustainability.journey_label")}</div>
          <h2 {...rich(t("sustainability.journey_title"))} />
          <div className="sust-lifecycle reveal-stagger">
            {steps.map((step, i) => (
              <div className="sust-lifecycle-item" key={step}>
                <div className="sust-lifecycle-num">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3>{t(`sustainability.step_${step}`)}</h3>
                <p>{t(`sustainability.step_${step}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-label text-center">{t("sustainability.milestones_label")}</div>
          <h2 className="text-center" {...rich(t("sustainability.milestones_title"))} />
          <div className="sust-timeline">
            {milestones.map((year) => (
              <div className="sust-timeline-item" key={year}>
                <div className="sust-timeline-dot" />
                <div className="sust-timeline-content">
                  <span className="sust-timeline-date">{year}</span>
                  <p>
                    {year === "2026" ? (
                      <strong>{t(`sustainability.milestone_${year}`)}</strong>
                    ) : (
                      t(`sustainability.milestone_${year}`)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section quote-section bg-noise reveal">
        <div className="container narrow text-center text-white">
          <i className="fa-solid fa-quote-left quote-icon" />
          <p className="quote-text">{t("sustainability.quote_text")}</p>
          <div className="quote-attrib">
            <span />
            <span>{t("sustainability.quote_attrib")}</span>
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow text-center">
          <div className="section-label">{t("sustainability.cta_label")}</div>
          <h2 {...rich(t("sustainability.cta_title"))} />
          <p className="text-large">{t("sustainability.cta_text")}</p>
          <Link href="/trade" className="btn btn-primary">
            {t("sustainability.cta_btn")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
