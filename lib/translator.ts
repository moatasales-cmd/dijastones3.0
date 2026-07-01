// Message dictionaries + translator. Imports the full EN/FR message JSON, so
// this module must only be used on the server (via lib/i18n-server.ts).
import type { Locale } from "./i18n";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const dicts: Record<Locale, Record<string, string>> = { en, fr };

// The source messages (ported from the PHP site) were authored with HTML
// entities for direct echo. React renders text nodes literally, so decode
// the common entities to real characters. Actual tags (<br>, <em>…) are
// untouched — those strings are rendered via rich()/dangerouslySetInnerHTML.
const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", middot: "·", bull: "•",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  deg: "°", times: "×", copy: "©", reg: "®", trade: "™",
  eacute: "é", egrave: "è", agrave: "à", ecirc: "ê", ccedil: "ç",
  uuml: "ü", ouml: "ö", auml: "ä", ntilde: "ñ", iacute: "í", oacute: "ó",
  frac12: "½", frac14: "¼", frac34: "¾", euro: "€", pound: "£",
};
function decodeEntities(s: string): string {
  if (s.indexOf("&") === -1) return s;
  return s.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X"
        ? parseInt(e.slice(2), 16)
        : parseInt(e.slice(1), 10);
      return Number.isNaN(cp) ? m : String.fromCodePoint(cp);
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

// Replace %s / %d sequentially with args; %% -> literal % (mirrors vsprintf).
function format(msg: string, args: (string | number)[]): string {
  const decoded = decodeEntities(msg);
  if (args.length === 0) return decoded;
  let i = 0;
  return decoded.replace(/%%|%[sd]/g, (m) =>
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
