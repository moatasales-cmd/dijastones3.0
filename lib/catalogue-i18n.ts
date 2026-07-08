import type { T } from "@/lib/translator";

/**
 * Localise the raw English DB values the catalogue renders (stone type,
 * country, colour-name). Each maps to an existing message key; the translator
 * falls back to English, so a missing key never shows a raw key string.
 */

/** "Marble" -> localized type name via quarries.type_marble. */
export function catType(t: T, ty: string | null | undefined): string {
  if (!ty) return "";
  const key = `quarries.type_${ty.toLowerCase()}`;
  const v = t(key);
  return v === key ? ty : v;
}

/** "Italy" -> localized country name via quarries.country_italy. */
export function catCountry(t: T, c: string | null | undefined): string {
  if (!c) return "";
  const key = `quarries.country_${c.toLowerCase()}`;
  const v = t(key);
  return v === key ? c : v;
}

/** Normalise a colour word to its message-key suffix: "Blue-Grey" -> blue_grey. */
function colourKey(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/**
 * Localise a free-form colour name like "White / Gold" or "Grey Cross-Veined".
 * Splits on "/" and translates each whitespace-separated word via catcolor.*,
 * leaving anything unknown as-is. Word order isn't reflowed — acceptable for
 * short colour tags across languages.
 */
export function catColour(t: T, cn: string | null | undefined): string {
  if (!cn) return "";
  return cn
    .split("/")
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .map((word) => {
          if (!word) return word;
          const key = `catcolor.${colourKey(word)}`;
          const v = t(key);
          return v === key ? word : v;
        })
        .join(" ")
    )
    .join(" / ");
}
