// Message dictionaries + translator. Imports the full EN/FR message JSON, so
// this module must only be used on the server (via lib/i18n-server.ts).
import type { Locale } from "./i18n";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const dicts: Record<Locale, Record<string, string>> = { en, fr };

// Replace %s / %d sequentially with args; %% -> literal % (mirrors vsprintf).
function format(msg: string, args: (string | number)[]): string {
  if (args.length === 0) return msg;
  let i = 0;
  return msg.replace(/%%|%[sd]/g, (m) =>
    m === "%%" ? "%" : String(args[i++] ?? "")
  );
}

/** Build a translator bound to a locale. Falls back to EN, then the key. */
export function translator(locale: Locale) {
  const dict = dicts[locale] ?? dicts.en;
  return function t(key: string, ...args: (string | number)[]): string {
    const msg = dict[key] ?? dicts.en[key] ?? key;
    return format(msg, args);
  };
}

export type T = ReturnType<typeof translator>;
