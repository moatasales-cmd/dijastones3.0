import type { Locale } from "./i18n";

/** Reads row.i18n[locale][field] if present, else undefined. Posts/Projects
 * store EN (base columns) and FR (`${field}Fr` columns) directly, but the
 * other 8 site locales live in a single `i18n` JSON column keyed by locale —
 * see the Post/Project model comments in prisma/schema.prisma. */
function i18nField(row: Record<string, unknown>, field: string, locale: Locale): unknown {
  const i18n = row.i18n as Record<string, Record<string, unknown>> | null | undefined;
  return i18n?.[locale]?.[field];
}

/**
 * Pick a translated text field for the current locale, falling back to the
 * base (English) field whenever a translation is missing — so a post/project
 * that hasn't been translated into a given language yet still renders
 * something instead of a blank string. Mirrors the old t($item, $field) helper.
 */
export function tf(
  row: Record<string, unknown>,
  field: string,
  locale: Locale
): string {
  if (locale === "fr") {
    const fr = row[`${field}Fr`];
    if (typeof fr === "string" && fr) return fr;
  } else if (locale !== "en") {
    const v = i18nField(row, field, locale);
    if (typeof v === "string" && v) return v;
  }
  const v = row[field];
  return typeof v === "string" ? v : "";
}

/** Same as tf but for paragraph-array fields (stored as JSON arrays). */
export function tfArr(
  row: Record<string, unknown>,
  field: string,
  locale: Locale
): string[] {
  let primary: unknown;
  if (locale === "fr") primary = row[`${field}Fr`];
  else if (locale !== "en") primary = i18nField(row, field, locale);
  const v = Array.isArray(primary) ? primary : row[field];
  return Array.isArray(v) ? (v as string[]) : [];
}

/** Neutral placeholder background for items without imagery. */
export const FALLBACK_BG =
  "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))";

/**
 * Spread onto an element to render a translated string that contains trusted
 * inline markup (<br>, <em>, <strong>…), e.g. `<h1 {...rich(t("x"))} />`.
 * Content is from our own message files, never user input.
 */
export const rich = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });
