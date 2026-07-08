import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/seo";
import { rich } from "@/lib/lang";
import QuarryAccordion, {
  type QuarryCountry,
} from "@/components/QuarryAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return pageMeta({ title: t("title.quarries"), description: t("quarries.hero_text"), path: "/quarries" });
}

// Country name (matches stone.c) + stone types + districts. The narrative
// fields (geology/extraction/blocks/ports/note) come from translation keys;
// districts are literal, as in the original quarries.php.
const QUARRY_COUNTRIES: { name: string; types: string[]; districts: string[] }[] = [
  { name: "Turkey", types: ["Marble", "Limestone", "Travertine"], districts: ["Marmara Island (Balıkesir)", "Afyonkarahisar", "Burdur / Bucak", "Denizli (travertine)", "Antalya / Elmalı", "Sivas", "Muğla / Yatağan", "İzmir", "Bilecik", "Kaklık"] },
  { name: "Italy", types: ["Marble", "Limestone"], districts: ["Carrara Basin (Tuscany)", "Lessini Mountains (Veneto)", "La Spezia (Liguria)", "Aosta Valley", "Palermo (Sicily)", "Lecce / Salento (Apulia)"] },
  { name: "Greece", types: ["Marble"], districts: ["Thassos Island", "Drama (Macedonia)", "Volos (Thessaly)", "Euboea (Evia)", "Tinos (Cyclades)", "Naxos", "Kozani", "Skyros (Sporades)", "Kavala", "Veria"] },
  { name: "Spain", types: ["Marble", "Limestone"], districts: ["Pinoso / Alicante (Crema Marfil)", "Markina (Nero Marquina)", "Murcia (Marrón Emperador)", "Macael (Blanco Macael)", "Tarragona (Gris Pulpis)", "Ibiza (Blanco Ibiza)", "Cuenca", "Castellón"] },
  { name: "France", types: ["Marble", "Limestone"], districts: ["Saint-Pons (Languedoc)", "Caunes-Minervois", "Comblanchien (Burgundy)", "Massangis (Burgundy)", "Sarrancolin (Pyrenees)", "Arudy (Pyrenees)"] },
  { name: "Portugal", types: ["Marble", "Limestone"], districts: ["Estremoz / Borba / Vila Viçosa (Alentejo)", "Sintra (Lisbon)", "Ançã (Coimbra)"] },
  { name: "Tunisia", types: ["Marble", "Limestone"], districts: ["Thala (Kasserine)", "Chemtou (Jendouba)", "Kesra (Siliana)", "Carthage (Tunis)", "Sidi Kacem", "Keddel", "Matmata", "Ghoumrassen", "Ain Drahem"] },
  { name: "Iran", types: ["Onyx", "Travertine", "Granite", "Limestone"], districts: ["Azarshahr (East Azerbaijan)", "Mahallat (Markazi)", "Natanz (Isfahan)", "Abadeh (Fars)", "Dehbid (Fars)"] },
  { name: "India", types: ["Marble", "Granite"], districts: ["Makrana (Rajasthan)", "Ambaji (Rajasthan)", "Udaipur (Rajasthan)", "Chimakurthy (Andhra Pradesh)", "Hyderabad (Telangana)", "Jalore (Rajasthan)", "Dharmapuri (Tamil Nadu)"] },
  { name: "Brazil", types: ["Granite", "Quartzite"], districts: ["Feira de Santana / Ceará", "Macaubas (Bahia)", "Bahia interior", "Espírito Santo"] },
];

const REGIONS = ["mediterranean_basin", "apuan_alps", "anatolian_plateau", "thassos_island", "estremoz_belt", "zagros_belt", "rajasthan_craton", "brazilian_shield"];

export default async function QuarriesPage() {
  const { t } = await getT();

  const stones = await prisma.stone.findMany({ select: { n: true, c: true } });
  const namesByCountry = (country: string) =>
    stones
      .filter((s) => s.c === country)
      .map((s) => s.n)
      .sort((a, b) => a.localeCompare(b));

  const countries: QuarryCountry[] = QUARRY_COUNTRIES.map((qc) => {
    const key = qc.name.toLowerCase();
    const names = namesByCountry(qc.name);
    const displayName = t(`quarries.country_${key}`);
    return {
      name: displayName,
      typeBadges: qc.types.map((ty) => t(`quarries.type_${ty.toLowerCase()}`)),
      varieties: names.length,
      geology: t(`quarries.geology_${key}`),
      extraction: t(`quarries.extraction_${key}`),
      blocks: t(`quarries.blocks_${key}`),
      districts: qc.districts.join(", "),
      ports: t(`quarries.ports_${key}`),
      note: t(`quarries.note_${key}`),
      varietiesFromLabel: t("quarries.varieties_from", displayName),
      stoneNames: names,
    };
  });

  const methods = [
    "fa-solid fa-circle-nodes",
    "fa-solid fa-scissors",
    "fa-solid fa-bolt",
    "fa-solid fa-wand-magic-sparkles",
  ];

  const blockRows: [string, string, string, string, string][] = [
    [t("quarries.row_1"), "2.7–3.2", "1.3–1.6", "1.2–1.5", "18–22"],
    [t("quarries.row_2"), "2.5–3.0", "1.2–1.5", "1.1–1.4", "14–18"],
    [t("quarries.row_3"), "2.5–3.0", "1.3–1.6", "1.2–1.5", "16–22"],
    [t("quarries.row_4"), "2.4–2.8", "1.4–1.8", "1.2", "14–19"],
    [t("quarries.row_5"), "2.4–2.8", "1.3–1.7", "1.0–1.3", "12–17"],
    [t("quarries.row_6"), "2.2–2.6", "1.3–1.6", "1.0–1.2", "12–16"],
    [t("quarries.row_7"), "3.2–3.8", "1.8–2.2", "1.6–2.0", "25–32"],
    [t("quarries.row_8"), "3.0–3.5", "1.6–2.0", "1.5–1.8", "22–28"],
    [t("quarries.row_9"), "2.8–3.2", "1.5–1.8", "1.4–1.7", "20–26"],
  ];

  // Counts derived from the live catalogue, so they never drift from reality.
  const countryCount = new Set(stones.map((s) => s.c)).size;
  const stats = [
    { num: String(countryCount), label: t("quarries.stat_countries") },
    { num: "30+", label: t("quarries.stat_quarries") },
    { num: String(stones.length), label: t("quarries.stat_varieties") },
    { num: "98%", label: t("quarries.stat_yield") },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("quarries.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("quarries.hero_title"))} />
          <p>{t("quarries.hero_text")}</p>
        </div>
      </section>

      <section className="section pt-0 reveal">
        <div className="container">
          <div className="section-label">{t("quarries.ethos_label")}</div>
          <h2 {...rich(t("quarries.ethos_title"))} />
          <div className="text-large">{t("quarries.ethos_text")}</div>
        </div>
      </section>

      <section className="section section-mist reveal">
        <div className="container">
          <div className="section-label text-center">{t("quarries.country_label")}</div>
          <h2 className="text-center" {...rich(t("quarries.country_title"))} />
          <QuarryAccordion
            countries={countries}
            labels={{
              geology: t("quarries.geology"),
              extraction: t("quarries.extraction"),
              blocks: t("quarries.blocks"),
              districts: t("quarries.districts"),
              ports: t("quarries.ports"),
              noteLabel: t("quarries.note_label"),
              varieties: t("quarries.varieties"),
            }}
          />
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-label text-center">{t("quarries.methods_label")}</div>
          <h2 className="text-center" {...rich(t("quarries.methods_title"))} />
          <div className="qry-methods-grid reveal-stagger">
            {methods.map((icon, i) => (
              <div className="qry-method-card" key={i}>
                <div className="qry-method-icon">
                  <i className={icon} />
                </div>
                <h3>{t(`quarries.method_${i + 1}_name`)}</h3>
                <span className="qry-method-stone">{t(`quarries.method_${i + 1}_stone`)}</span>
                <p>{t(`quarries.method_${i + 1}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark bg-noise reveal">
        <div className="container narrow">
          <div className="section-label">{t("quarries.block_label")}</div>
          <h2 {...rich(t("quarries.block_title"))} />
          <div className="qry-table-wrap">
            <table className="qry-block-table">
              <thead>
                <tr>
                  <th>{t("quarries.stone_type")}</th>
                  <th>{t("quarries.length")} (m)</th>
                  <th>{t("quarries.width")} (m)</th>
                  <th>{t("quarries.height")} (m)</th>
                  <th>{t("quarries.weight")} (t)</th>
                </tr>
              </thead>
              <tbody>
                {blockRows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-small" style={{ textAlign: "center", marginTop: "1rem", opacity: 0.6 }}>
            {t("quarries.block_note")}
          </p>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow">
          <div className="section-label">{t("quarries.field_label")}</div>
          <blockquote className="qry-field-note">
            <p {...rich(t("quarries.field_note_1"))} />
            <p>{t("quarries.field_note_2")}</p>
            <footer>— Orhan, {t("quarries.field_note_attrib")}</footer>
          </blockquote>
        </div>
      </section>

      <section className="section section-mist reveal">
        <div className="container">
          <div className="section-label text-center">{t("quarries.stats_label")}</div>
          <h2 className="text-center" {...rich(t("quarries.stats_title"))} />
          <div className="stats" style={{ marginTop: "3rem" }}>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="qry-footprint-text">
            <p>{t("quarries.footprint_text")}</p>
          </div>
        </div>
      </section>

      <section className="section qry-map-section">
        <div className="qry-map-bg" />
        <div className="qry-map-overlay" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-label text-center" style={{ color: "var(--accent)" }}>
            {t("quarries.footprint_label")}
          </div>
          <h2
            className="text-center"
            style={{ color: "var(--white)" }}
            {...rich(t("quarries.footprint_title"))}
          />
          <div className="qry-region-tags">
            {REGIONS.map((r) => (
              <span className="qry-region-tag" key={r}>
                {t(`quarries.region_${r}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow text-center">
          <div className="section-label">{t("quarries.custom_label")}</div>
          <h2 {...rich(t("quarries.custom_title"))} />
          <p className="text-large">{t("quarries.custom_text")}</p>
          <Link href="/contact" className="btn btn-primary">
            {t("quarries.custom_cta")}{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
