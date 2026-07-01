// Client-safe i18n constants and types. Deliberately imports NO message JSON,
// so client components can use these without pulling translations into the
// browser bundle. The dictionaries + translator live in lib/translator.ts
// (server-only usage via lib/i18n-server.ts).

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}
