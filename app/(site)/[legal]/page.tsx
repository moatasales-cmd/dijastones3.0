import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n-server";

// Legal pages (/privacy, /terms, /cookies) — one route, three slugs,
// mirroring the old pages/privacy.php. Only these slugs build; anything
// else 404s.
const LEGAL: Record<string, { titleKey: string; paraKeys: string[] }> = {
  privacy: {
    titleKey: "privacy.privacy_title",
    paraKeys: ["privacy.updated", "privacy.privacy_1", "privacy.privacy_2", "privacy.privacy_3", "privacy.privacy_4", "privacy.privacy_5"],
  },
  terms: {
    titleKey: "privacy.terms_title",
    paraKeys: ["privacy.updated", "privacy.terms_1", "privacy.terms_2", "privacy.terms_3"],
  },
  cookies: {
    titleKey: "privacy.cookies_title",
    paraKeys: ["privacy.updated", "privacy.cookies_1", "privacy.cookies_2", "privacy.cookies_3"],
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEGAL).map((legal) => ({ legal }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legal: string }>;
}): Promise<Metadata> {
  const { legal } = await params;
  const cfg = LEGAL[legal];
  if (!cfg) return {};
  const { t } = await getT();
  return { title: t(cfg.titleKey) };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ legal: string }>;
}) {
  const { legal } = await params;
  const cfg = LEGAL[legal];
  if (!cfg) notFound();

  const { t } = await getT();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/" className="back-link">
            <i className="fa-solid fa-arrow-left" /> {t("privacy.back")}
          </Link>
          <h1 className="hero-title">{t(cfg.titleKey)}</h1>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container narrow">
          {cfg.paraKeys.map((k) => (
            <p key={k} style={{ marginBottom: "1rem" }}>
              {t(k)}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
