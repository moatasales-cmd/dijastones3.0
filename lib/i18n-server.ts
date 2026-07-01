import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./i18n";
import { translator } from "./translator";

/** Current locale from the `lang` cookie (falls back to default). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  return isLocale(v) ? v : defaultLocale;
}

/** A translator bound to the request's locale, for server components. */
export async function getT() {
  const locale = await getLocale();
  return { t: translator(locale), locale };
}
