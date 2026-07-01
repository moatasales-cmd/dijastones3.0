import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import MaterialsGrid, { type GridStrings } from "@/components/MaterialsGrid";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("materials.title") };
}

export default async function MaterialsPage() {
  const { t } = await getT();

  const stones = await prisma.stone.findMany({
    select: {
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
    },
  });

  const uniqSort = (vals: (string | null)[]) =>
    [...new Set(vals.filter((v): v is string => !!v))].sort((a, b) =>
      a.localeCompare(b)
    );
  const countries = uniqSort(stones.map((s) => s.c));
  const types = uniqSort(stones.map((s) => s.ty));
  const tones = uniqSort(stones.map((s) => s.to));

  const strings: GridStrings = {
    searchPlaceholder: t("materials.search_placeholder"),
    sortDefault: t("materials.sort_default"),
    sortAz: t("materials.sort_az"),
    sortZa: t("materials.sort_za"),
    sortPriceAsc: t("materials.sort_price_asc"),
    sortPriceDesc: t("materials.sort_price_desc"),
    sortCountry: t("materials.sort_country"),
    allCountries: t("materials.all_countries"),
    allTypes: t("materials.all_types"),
    allTones: t("materials.all_tones"),
    clearFilters: t("materials.clear_filters"),
    showingPrefix: t("materials.showing_prefix"),
    showingOf: t("materials.showing_of"),
    results: t("materials.results"),
    noResults: t("materials.no_results"),
    resetFilters: t("materials.reset_filters"),
    from: t("materials.from"),
    premium: t("materials.premium"),
    exworks: t("materials.exworks_label"),
    exworksTitle: t("materials.exworks_title"),
    addFavorite: t("materials.add_favorite"),
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("materials.title")}</div>
          <h1 className="hero-title">{t("materials.hero_title")}</h1>
          <p>{t("materials.hero_text")}</p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="mat-download-section">
            <div className="mat-download-main">
              <div>
                <h3>{t("materials.catalogue_title")}</h3>
                <p className="mat-download-stats">
                  {t(
                    "materials.catalogue_stats",
                    `${stones.length} Natural Stones · 6 Types · 10 Countries · 170+ Pages`
                  )}
                </p>
              </div>
              <a
                href="/api/catalogue"
                target="_blank"
                className="mat-download-btn"
              >
                <i className="fa-solid fa-download" />{" "}
                {t("materials.download_catalogue")}
              </a>
            </div>
          </div>

          <MaterialsGrid
            stones={stones}
            countries={countries}
            types={types}
            tones={tones}
            strings={strings}
          />
        </div>
      </section>
    </>
  );
}
