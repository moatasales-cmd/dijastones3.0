/** Base site URL — used for canonical links, sitemaps, and structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

// A production build without a real site URL would silently ship
// "localhost:3000" into every canonical tag, sitemap entry, and JSON-LD
// block — poisoning the whole site's indexing. Fail loudly instead.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be set in production (e.g. https://dijastones.com) — canonicals/sitemap/JSON-LD would otherwise point at localhost."
  );
}
if (process.env.NODE_ENV === "production" && SITE_URL.includes("localhost")) {
  console.warn(
    `[seo] SITE_URL is "${SITE_URL}" in a production build — fine for a local test build, wrong for a real deploy.`
  );
}
