import type { Metadata } from "next";
import { getT } from "@/lib/i18n-server";
import { FALLBACK_BG, rich } from "@/lib/lang";
import IconicUses from "@/components/IconicUses";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.heritage") };
}

const sections: { title: string; texts: string[]; img: string | null }[] = [
  {
    title: "heritage.section_name",
    texts: [
      "heritage.section_name_text1",
      "heritage.section_name_text2",
      "heritage.section_name_text3",
      "heritage.section_name_text4",
    ],
    img: "/assets/images/heritage/the-name-behind-the-name.jpeg",
  },
  { title: "heritage.section_genesis", texts: ["heritage.section_genesis_text"], img: null },
  { title: "heritage.section_trust", texts: ["heritage.section_trust_text"], img: null },
  { title: "heritage.section_decade", texts: ["heritage.section_decade_text"], img: null },
  { title: "heritage.section_tunisia", texts: ["heritage.section_tunisia_text"], img: null },
  { title: "heritage.section_today", texts: ["heritage.section_today_text"], img: null },
  {
    title: "heritage.section_future",
    texts: ["heritage.section_future_text1", "heritage.section_future_text2"],
    img: null,
  },
];

export default async function HeritagePage() {
  const { t } = await getT();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("heritage.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("heritage.hero_title"))} />
          <p>{t("heritage.hero_text")}</p>
        </div>
      </section>

      {sections.map((sec) => (
        <section className="heritage-section" key={sec.title}>
          <div className="container">
            <div className="heritage-row">
              <div className="heritage-image">
                {sec.img ? (
                  <img src={sec.img} alt="" />
                ) : (
                  <div style={{ width: "100%", height: "100%", minHeight: 280, background: FALLBACK_BG }} />
                )}
              </div>
              <div className="heritage-text">
                <h2>{t(sec.title)}</h2>
                {sec.texts.map((k) => (
                  <p key={k}>{t(k)}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <IconicUses t={t} />
    </>
  );
}
