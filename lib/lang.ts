import type { Locale } from "./i18n";

/**
 * Pick a bilingual text field: the `${field}Fr` variant when locale is French
 * and present, else the base field. Mirrors the old t($item, $field) helper.
 */
export function tf(
  row: Record<string, unknown>,
  field: string,
  locale: Locale
): string {
  if (locale === "fr") {
    const fr = row[`${field}Fr`];
    if (typeof fr === "string" && fr) return fr;
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
  const primary = locale === "fr" ? row[`${field}Fr`] : undefined;
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
