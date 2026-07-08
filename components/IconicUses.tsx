import Link from "next/link";
import iconicUses from "@/config/iconic-uses.json";
import type { T } from "@/lib/translator";

/**
 * Independently-documented historical uses of a stone TYPE (e.g. the Pantheon
 * floor, the UN podium) — never DIJA's own supplied projects. Each entry's
 * facts are sourced/verifiable (see sourceLabel) so this stays honest: we are
 * showing where a material has appeared in the world, not claiming we put
 * it there. Keep this section visually and textually distinct from
 * "Projects", which is reserved for DIJA's own real, client-permissioned work.
 */
export default function IconicUses({ t }: { t: T }) {
  return (
    <section className="heritage-section">
      <div className="container">
        <h2>{t("heritage.iconic_title")}</h2>
        <p style={{ maxWidth: "720px", marginBottom: "2rem", opacity: 0.85 }}>
          {t("heritage.iconic_intro")}
        </p>
        <div className="grid-3">
          {iconicUses.map((item) => (
            <div className="card-article" key={item.stoneId} style={{ cursor: "default" }}>
              <div className="card-img">
                <img src={item.image} alt={item.landmark} loading="lazy" />
              </div>
              <div className="card-meta">
                {item.location} · {item.era}
              </div>
              <h3>{item.landmark}</h3>
              <p>{t(item.textKey)}</p>
              <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.5rem" }}>
                {item.sourceLabel}
              </p>
              <Link href={`/materials/${item.stoneId}`} className="pf-btn pf-btn-ghost" style={{ marginTop: "0.75rem" }}>
                <i className="fa-solid fa-gem" /> {t("heritage.iconic_see_stone")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
