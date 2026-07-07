import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

/**
 * Path-based locales for SEO (SEO-PLAN Phase 3): /fr/materials serves the
 * French version of /materials. Googlebot carries no cookies, so without
 * URL-addressable locales only English ever gets indexed.
 *
 * Implementation is a rewrite, not a route move: the existing (unprefixed)
 * routes keep serving the cookie-selected language, while /{locale}/...
 * rewrites internally to the same page with the locale forced via a request
 * header that lib/i18n-server.ts prefers over the cookie.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];
  if (!isLocale(seg) || seg === defaultLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = pathname.slice(seg.length + 1) || "/";

  const headers = new Headers(req.headers);
  headers.set("x-dija-locale", seg);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Non-default locales only — "/" stays English, and /en/* is deliberately
  // not served (it would duplicate the unprefixed pages).
  matcher: ["/(fr|es|pt|ru|el|ar|zh|ja|tr)/:path*"],
};
