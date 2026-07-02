import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stoneImg } from "@/lib/img";
import { getT } from "@/lib/i18n-server";

// Signature materials shown on the home page, in this order.
const FEATURED_IDS = [
  "calacatta-oro",
  "black-aziza",
  "blue-bahia-granite",
  "taj-mahal-quartzite",
];

// Some titles carry inline markup (<br>, <em>) in the message data, exactly
// as the old PHP echoed them. Render those as HTML.
const html = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });

export default async function Home() {
  const { t } = await getT();

  const featuredRows = await prisma.stone.findMany({
    where: { id: { in: FEATURED_IDS } },
    select: { id: true, n: true, ci: true, c: true, g: true },
  });
  const featured = FEATURED_IDS.map(
    (id) => featuredRows.find((s) => s.id === id)!
  ).filter(Boolean);

  const posts = await prisma.post.findMany({
    take: 2,
    select: { id: true, t: true, c: true, r: true, e: true, img: true },
  });

  // Live counts — the headline stats stay honest as the catalogue grows.
  const allOrigins = await prisma.stone.findMany({ select: { c: true } });
  const stoneCount = allOrigins.length;
  const countryCount = new Set(allOrigins.map((s) => s.c)).size;

  return (
    <>
      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: "url(/assets/images/hero-bg.webp)" }}
        />
        <div className="hero-overlay" />
        <div className="hero-iridescent" />
        <div className="hero-noise" />
        <div className="hero-content">
          <h1 {...html(t("home.hero.title"))} />
          <p className="hero-sub">{t("home.hero.subtitle")}</p>
          <div className="hero-btns">
            <Link href="/materials" className="btn btn-ghost">
              {t("home.hero.explore")}{" "}
              <span className="btn-icon-wrap">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </Link>
            <a href="/catalogue" target="_blank" className="btn btn-ghost">
              {t("home.hero.download")}{" "}
              <span className="btn-icon-wrap">
                <i className="fa-solid fa-arrow-down" />
              </span>
            </a>
          </div>
          <div className="scroll-indicator">
            <span />
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow">
          <div className="section-label">{t("home.why_label")}</div>
          <h2 {...html(t("home.why_title"))} />
          <div className="text-large">{t("home.why_text")}</div>
          <p>{t("home.why_text2")}</p>
          <Link
            href="/materials"
            className="btn btn-primary"
            style={{ marginBottom: "2rem" }}
          >
            {t("home.explore_btn")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
          <div className="stats">
            <div className="stat">
              <span className="stat-num">{stoneCount}</span>
              <span className="stat-label">{t("home.stat_stones")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{countryCount}</span>
              <span className="stat-label">{t("home.stat_countries")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">47</span>
              <span className="stat-label">{t("home.stat_shipped")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark bg-noise reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">{t("home.signature_label")}</div>
              <h2 {...html(t("home.signature_title"))} />
            </div>
            <Link href="/materials" className="link-arrow">
              {t("home.all_materials")} <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <div className="grid-4 reveal-stagger">
            {featured.map((s) => (
              <Link
                key={s.id}
                href={`/materials/${s.id}`}
                className="card-swatch"
              >
                <div className="card-img">
                  {stoneImg(s) ? (
                    <img src={stoneImg(s)!} alt={s.n} loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
                      }}
                    />
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
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow reveal">
          <div className="section-label">{t("home.featured_label")}</div>
          <h2 {...html(t("home.featured_title"))} />
          <p className="text-large">{t("home.featured_text")}</p>
          <div className="stats border-top">
            <div className="stat">
              <span className="stat-num">84 t</span>
              <span className="stat-label">{t("home.stat_tonnage")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">312</span>
              <span className="stat-label">{t("home.stat_panels")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">25 wk</span>
              <span className="stat-label">{t("home.stat_duration")}</span>
            </div>
          </div>
          <Link href="/projects/cala-luna" className="btn btn-primary">
            {t("home.case_study_btn")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </section>

      <section className="section section-mist reveal">
        <div className="container">
          <div className="section-label text-center">
            {t("home.process_label")}
          </div>
          <h2 className="text-center" {...html(t("home.process_title"))} />
          <div className="process-grid reveal-stagger">
            {[1, 2, 3, 4].map((i) => {
              const n = String(i).padStart(2, "0");
              return (
                <div className="process-card" key={i}>
                  <div className="process-num">{n}</div>
                  <h3>{t(`home.process_${n}_title`)}</h3>
                  <p>{t(`home.process_${n}_text`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section quote-section bg-noise reveal">
        <div className="container narrow text-center text-white">
          <i className="fa-solid fa-quote-left quote-icon" />
          <p className="quote-text">{t("home.quote_text")}</p>
          <div className="quote-attrib">
            <span />
            <span>{t("home.quote_attribution")}</span>
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">{t("home.journal_label")}</div>
              <h2 {...html(t("home.journal_title"))} />
            </div>
            <Link href="/journal" className="link-arrow">
              {t("home.all_entries")} <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <div className="grid-3 reveal-stagger">
            {posts.map((a) => (
              <Link
                key={a.id}
                href={`/journal/${a.id}`}
                className="card-article"
              >
                <div className="card-img">
                  {a.img ? (
                    <img src={a.img} alt="" loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
                      }}
                    />
                  )}
                </div>
                <div className="card-meta">
                  {a.c} · {a.r}
                </div>
                <h3>{a.t}</h3>
                <p>{a.e}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
