// Client-safe i18n constants and types. Deliberately imports NO message JSON,
// so client components can use these without pulling translations into the
// browser bundle. The dictionaries + translator live in lib/translator.ts
// (server-only usage via lib/i18n-server.ts).

export const locales = ["en", "fr", "es", "pt", "ru", "el", "ar", "zh", "ja", "tr", "it", "de", "fa"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  pt: "Português",
  ru: "Русский",
  el: "Ελληνικά",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  tr: "Türkçe",
  it: "Italiano",
  de: "Deutsch",
  fa: "فارسی",
};

export const rtlLocales: readonly Locale[] = ["ar", "fa"];
export function isRtl(locale: Locale): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}
