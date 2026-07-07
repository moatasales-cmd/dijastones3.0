import "server-only";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./i18n";
import { translator } from "./translator";

/**
 * Current locale. Priority: the x-dija-locale header (set by middleware.ts
 * for /fr/..., /ar/... style URLs — the crawlable, SEO-visible variant),
 * then the `lang` cookie (the visitor's saved preference), then English.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromPath = h.get("x-dija-locale");
  if (isLocale(fromPath)) return fromPath;
  const store = await cookies();
  const v = store.get("lang")?.value;
  return isLocale(v) ? v : defaultLocale;
}

/** A translator bound to the request's locale, for server components. */
export async function getT() {
  const locale = await getLocale();
  return { t: translator(locale), locale };
}
