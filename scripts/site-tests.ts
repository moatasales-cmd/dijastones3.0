/**
 * Site-wide smoke/bug test. Crawls every sitemap URL plus locale variants
 * and API edge cases, checking status codes, error markers, i18n leakage
 * (raw message keys in rendered HTML), html lang/dir attributes, and basic
 * API validation behavior. Prints a failure report; exits 1 on any failure.
 */
const BASE = "http://localhost:3000";

type Fail = { url: string; problem: string };
const fails: Fail[] = [];
let checked = 0;

const RTL = new Set(["ar", "fa"]);
const ALL_LOCALES = ["en", "fr", "es", "pt", "ru", "el", "ar", "zh", "ja", "tr", "it", "de", "fa"];
const SAMPLE_LOCALES = ["en", "fr", "tr", "ar", "it", "de", "fa"];

// Visible raw i18n keys like ">nav.stone<" or ">casestudy.hero_text<"
const RAW_KEY_RE = />((?:nav|title|meta|materials|material|collections?|projects?|project|heritage|quarries|sustainability|journal|article|contact|trade|login|proforma(?:_view|_pdf)?|api|catalogue|datasheet|dash|favorites|client_proformas|privacy|admin|error|newsletter|home|incoterm|payment|cost|col|casestudy|footer|lightbox|theme|mobile|lang)\.[a-z0-9_.]+)</;

async function checkPage(path: string, locale: string) {
  const url = `${BASE}${path}`;
  checked++;
  let res: Response;
  try {
    res = await fetch(url, { redirect: "manual" });
  } catch (e) {
    fails.push({ url: path, problem: `fetch failed: ${e}` });
    return;
  }
  if (res.status !== 200) {
    fails.push({ url: path, problem: `HTTP ${res.status}` });
    return;
  }
  const html = await res.text();
  if (html.includes("Application error") || html.includes("__next_error__")) {
    fails.push({ url: path, problem: "error page marker in HTML" });
  }
  const rawKey = html.match(RAW_KEY_RE);
  if (rawKey) {
    fails.push({ url: path, problem: `raw i18n key leaked: ${rawKey[1]}` });
  }
  const langAttr = (html.match(/<html lang="([^"]*)"/) || [])[1];
  if (langAttr !== locale) {
    fails.push({ url: path, problem: `html lang="${langAttr}" expected "${locale}"` });
  }
  const dirAttr = (html.match(/<html[^>]*dir="([^"]*)"/) || [])[1];
  const expectedDir = RTL.has(locale) ? "rtl" : "ltr";
  if (dirAttr !== expectedDir) {
    fails.push({ url: path, problem: `dir="${dirAttr}" expected "${expectedDir}"` });
  }
}

async function main() {
  // 1) Collect paths from the sitemap (EN entries only; we add prefixes ourselves)
  const sm = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const enPaths = [
    ...new Set(
      urls
        .map((u) => new URL(u).pathname)
        .filter((p) => !ALL_LOCALES.some((l) => p === `/${l}` || p.startsWith(`/${l}/`)))
    ),
  ];
  console.log(`sitemap: ${urls.length} urls, ${enPaths.length} unique EN paths`);

  // 2) All static-ish pages in all locales; dynamic details sampled
  const isDetail = (p: string) => /\/(materials|collections|projects|journal|case-studies)\/[^/]+$/.test(p);
  const staticPaths = enPaths.filter((p) => !isDetail(p));
  const detailSample = ["materials", "collections", "projects", "journal", "case-studies"].flatMap((sec) =>
    enPaths.filter((p) => new RegExp(`^/${sec}/[^/]+$`).test(p)).slice(0, 3)
  );

  for (const p of staticPaths) {
    for (const l of SAMPLE_LOCALES) {
      await checkPage(l === "en" ? p : `/${l}${p === "/" ? "" : p}` || "/", l);
    }
  }
  for (const p of detailSample) {
    for (const l of ["en", "fr", "ar", "it"]) {
      await checkPage(l === "en" ? p : `/${l}${p}`, l);
    }
  }

  // 3) Content spot checks
  const frStory = await fetch(`${BASE}/fr/journal/story-abc-office`).then((r) => r.text());
  if (!/archive|projets|pierre/i.test(frStory) || frStory.includes("We came across Abc Office")) {
    fails.push({ url: "/fr/journal/story-abc-office", problem: "story body not French" });
  }
  const frStone = await fetch(`${BASE}/fr/materials/calacatta-oro`).then((r) => r.text());
  if (!frStone.includes("Alpes Apuanes")) {
    fails.push({ url: "/fr/materials/calacatta-oro", problem: "stone description not French (dFr not rendering)" });
  }
  const trStone = await fetch(`${BASE}/tr/materials/calacatta-oro`).then((r) => r.text());
  if (!trStone.includes("Apuan Alpleri")) {
    fails.push({ url: "/tr/materials/calacatta-oro", problem: "stone description not Turkish (i18n col not rendering)" });
  }

  // 4) 404 behavior
  for (const p of ["/materials/does-not-exist", "/case-studies/nope", "/journal/nope"]) {
    const res = await fetch(`${BASE}${p}`);
    checked++;
    if (res.status !== 404) fails.push({ url: p, problem: `expected 404, got ${res.status}` });
  }

  // 5) API validation edge cases (no DB writes on the happy path)
  const post = (p: string, body: unknown) =>
    fetch(`${BASE}${p}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const contactEmpty = await post("/api/contact", {});
  checked++;
  if (contactEmpty.status === 200) {
    const j = await contactEmpty.json().catch(() => null);
    if (!j || j.ok !== false) fails.push({ url: "/api/contact {}", problem: "accepted empty submission" });
  }
  const newsletterBad = await post("/api/newsletter", { email: "not-an-email" });
  checked++;
  const nb = await newsletterBad.json().catch(() => null);
  if (newsletterBad.status === 200 && nb && nb.ok === true) {
    fails.push({ url: "/api/newsletter bad email", problem: "accepted invalid email" });
  }
  const favUnauth = await fetch(`${BASE}/api/favorites`);
  checked++;
  if (favUnauth.status === 200) {
    const j = await favUnauth.json().catch(() => null);
    if (j && Array.isArray(j.favorites) && j.favorites.length > 0) {
      fails.push({ url: "/api/favorites unauth", problem: "returned data without auth" });
    }
  }
  const meUnauth = await fetch(`${BASE}/api/auth/me`);
  checked++;
  if (meUnauth.status === 200) {
    const j = await meUnauth.json().catch(() => null);
    if (j && j.client) fails.push({ url: "/api/auth/me unauth", problem: "returned client without session" });
  }

  // 6) robots
  const robots = await fetch(`${BASE}/robots.txt`).then((r) => r.text());
  checked++;
  if (!robots.includes("Disallow: /admin")) fails.push({ url: "/robots.txt", problem: "missing admin disallow" });

  // Report
  console.log(`\nchecked: ${checked} requests`);
  if (fails.length === 0) {
    console.log("ALL PASS");
  } else {
    console.log(`FAILURES: ${fails.length}`);
    for (const f of fails) console.log(` - ${f.url} :: ${f.problem}`);
    process.exit(1);
  }
}

main();
