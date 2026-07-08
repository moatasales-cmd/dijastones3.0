import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { locales, defaultLocale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

/** /fr for French, "" for the default locale (English lives unprefixed). */
function localePrefix(locale: string): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

/** Strip the inline markup (<br>, <em>) some i18n strings carry so they can
 * be used in meta descriptions. */
export function plain(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Shared page metadata builder: canonical URL, OpenGraph, Twitter card, and
 * robots directives in one place so every public page emits the same
 * complete set of tags (see SEO-PLAN.md Part 4, items 2-6 and 9).
 */
export async function pageMeta({
  title,
  description,
  path,
  ogImage,
  ogType = "website",
  noIndex = false,
  langAlternates,
}: {
  title: string;
  description?: string;
  /** URL path starting with "/" — e.g. "/materials/calacatta-oro" */
  path: string;
  ogImage?: string | null;
  ogType?: "website" | "article";
  noIndex?: boolean;
  /**
   * Locales whose CONTENT is genuinely translated (not just the UI chrome).
   * Defaults to all. hreflang only advertises these; for any other locale's
   * URL the canonical points back at the English page, so Google never sees
   * us claiming a translation that is actually English text.
   */
  langAlternates?: readonly string[];
}): Promise<Metadata> {
  const locale = await getLocale();
  const rel = path === "/" ? "" : path;
  const translated = langAlternates
    ? locales.filter((l) => l === defaultLocale || langAlternates.includes(l))
    : [...locales];
  // Canonical points at this locale's own URL — unless this locale variant
  // isn't really translated, in which case it canonicalizes to English.
  const ownLocale = translated.includes(locale) ? locale : defaultLocale;
  const url = `${SITE_URL}${localePrefix(ownLocale)}${rel}` || SITE_URL;
  const languages =
    noIndex || translated.length <= 1
      ? undefined
      : {
          ...Object.fromEntries(
            translated.map((l) => [l, `${SITE_URL}${localePrefix(l)}${rel}` || SITE_URL])
          ),
          "x-default": `${SITE_URL}${rel}` || SITE_URL,
        };
  const desc = description ? plain(description) : undefined;
  const ogCommon = {
    title,
    description: desc,
    url,
    siteName: "DIJA Natural Stone",
    ...(ogImage ? { images: [{ url: ogImage }] } : {}),
  };
  return {
    title,
    description: desc,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    // Next's OpenGraph type discriminates on `type`, so keep it a literal
    // in each branch rather than passing the union variable through.
    openGraph:
      ogType === "article"
        ? { ...ogCommon, type: "article" }
        : { ...ogCommon, type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
  };
}

/**
 * Which locales a DB row is genuinely translated into, following the same
 * storage convention as lib/lang.ts: EN in the base columns, FR in
 * `{field}Fr`, everything else in the `i18n` JSON column keyed by locale.
 * `fields` are the base field names that constitute "real content" — the
 * row counts as translated when at least one of them has a value.
 */
export function translatedLocales(
  row: Record<string, unknown>,
  fields: string[]
): string[] {
  const out: string[] = [defaultLocale];
  if (fields.some((f) => row[`${f}Fr`])) out.push("fr");
  const j = row.i18n;
  if (j && typeof j === "object") {
    for (const [loc, vals] of Object.entries(j as Record<string, Record<string, unknown>>)) {
      if (vals && fields.some((f) => vals[f])) out.push(loc);
    }
  }
  return out;
}

/** schema.org Organization — emitted once, in the root layout. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DIJA Natural Stone",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/logo-light.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "10031 Sok. No: 14, AOSB, Çiğli",
      postalCode: "35620",
      addressLocality: "Izmir",
      addressCountry: "TR",
    },
    telephone: "+90 232 556 12 00",
    email: "contact@dijastones.com",
  };
}

/** schema.org BreadcrumbList for detail pages. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/** schema.org Article for journal posts. */
export function articleLd({
  title,
  description,
  path,
  image,
  author,
  datePublished,
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  author?: string | null;
  datePublished?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(description ? { description: plain(description) } : {}),
    url: `${SITE_URL}${path}`,
    ...(image ? { image: [`${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`] } : {}),
    ...(author ? { author: { "@type": "Person", name: author } } : {}),
    // dt is stored as display text ("May 4, 2026") — schema.org wants ISO.
    ...(datePublished && !isNaN(Date.parse(datePublished))
      ? { datePublished: new Date(datePublished).toISOString().slice(0, 10) }
      : {}),
    publisher: { "@type": "Organization", name: "DIJA Natural Stone", url: SITE_URL },
  };
}
