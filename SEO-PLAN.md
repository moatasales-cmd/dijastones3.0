# DIJA Natural Stone — SEO Research & Action Plan

*Prepared July 2026. Keyword evidence below comes from mining the full 113-project
industry archive (the same corpus behind our Case Studies) for the exact terms
architects and buyers use, cross-referenced with our own 152-stone catalogue.
Live Google SERP/volume sampling was unavailable at research time (web tooling
outage) — validate volumes free in Google Keyword Planner once Search Console
is connected (Phase 0). Directional confidence is high because the vocabulary
is taken from real specification documents, not guessed.*

---

## Part 1 — How Google actually works (the 4 stages)

Understanding this explains *why* every action item below matters.

### 1. Crawling
Googlebot discovers pages by following links and reading your `sitemap.xml`.
It fetches pages like a browser — but with a budget. Sites it trusts get
crawled more often and deeper.

**What this means for DIJA:** our sitemap already lists all 113 case studies,
~150 stones, collections, projects and posts (good). But anything the crawler
can't reach by URL **does not exist** to Google — this is why the cookie-based
language switching is our single biggest problem (see audit below).

### 2. Rendering & indexing
Google reads the HTML that arrives in the *first response*, then (later, in a
second wave) runs JavaScript. Pages whose content is server-rendered get
indexed faster and more reliably than client-rendered ones. It decides what a
page is "about" from the `<title>`, `<h1>`, headings, body text, image alt
text, and internal links pointing at it — then stores it in the index, *one
entry per canonical URL*.

- **Duplicate content** (two URLs, same content) splits your ranking power.
  The `canonical` tag tells Google which URL is the "real" one.
- **Thin content** (a page with 40 words and a photo) gets indexed but never
  ranks. Pages need real, unique text.

### 3. Ranking
When someone searches, Google scores indexed pages against ~200 signals. The
ones that actually move the needle for a site like ours:

| Signal | Plain English |
|---|---|
| **Relevance** | Does the page's title/headings/text match the query's words *and intent*? |
| **Backlinks** | Do other reputable sites link to you? Still the strongest "trust" signal. |
| **E-E-A-T** | Experience, Expertise, Authoritativeness, Trust. Real company info, real author, real address, sources cited. |
| **Core Web Vitals** | Page speed & stability (LCP < 2.5s, CLS < 0.1, INP < 200ms). A tiebreaker, not a golden ticket. |
| **Freshness** | Regularly updated sites get re-crawled and re-scored more often. The Journal is our freshness engine. |
| **Structured data** | JSON-LD tells Google "this is a Product, price $98/m²" → rich results (stars, prices) in the SERP. |

### 4. Serving (intent matching)
Google classifies every query's *intent*: informational ("what is travertine"),
commercial ("best marble for bathroom floor"), transactional ("buy calacatta
marble slab"), navigational ("dija stones"). **A product page can't rank for an
informational query and a blog post can't rank for a transactional one.** This
is why we need both: Materials pages for buying queries, Journal posts for
learning queries — interlinked so authority flows between them.

---

## Part 2 — Audit of dijastones.com (current state)

### Working in our favor ✅
- Server components everywhere on public pages — content arrives fully
  rendered in the first HTML response (the #1 prerequisite; many competitors
  fail this).
- `sitemap.xml` covering all ~300+ URLs, `robots.ts` correctly blocking
  admin/api/account pages.
- Product JSON-LD + canonical + OpenGraph on material detail pages.
- Unique `generateMetadata` titles on all 24 page types.
- 113 case studies + journal + heritage content = a genuine content moat.
  Our main competitor's own pages have `<title>Projects : Turkish Stones</title>`
  and a site-wide description of "HOMELAND OF NATURAL STONES" — they rank on
  domain age and backlinks, not on-page quality. That's beatable.

### Problems, in order of severity ❌

1. **Languages are invisible to Google.** Locale is a cookie; every language
   serves from the same URL. Googlebot carries no cookies → only English is
   ever crawled or indexed. Fix = locale-prefixed URLs (`/fr/materials/...`)
   + `hreflang` alternates.
2. **`SITE_URL` falls back to `http://localhost:3000`.** If
   `NEXT_PUBLIC_SITE_URL` isn't set in production, every canonical, sitemap
   entry, and JSON-LD url literally says "localhost". Must verify in prod.
3. **Canonical/OG/JSON-LD on only 1 of 24 page types** (materials detail).
   Everything in Part 5's checklist needs rolling out to the other 23.
4. **Homepage title/description are brand-only** — none of the words buyers
   type (supplier, exporter, wholesale, slabs, price, Turkey).
5. **No Organization schema, no Google Business Profile** — nothing telling
   Google DIJA is a real company in Izmir (E-E-A-T).
6. **Images:** no `next/image`, no explicit dimensions (CLS risk), generic
   filenames, unoptimized sizes.
7. **No analytics/Search Console** — flying blind.

---

## Part 3 — Keyword research (evidence-based)

### How this list was built
We extracted every stone name, application, and location from the 113
architect-credited project specifications in our reference corpus and combined
them with our own catalogue names. These are the words *the industry itself
uses* — which is exactly what its buyers type into Google.

### 3.1 The keyword formula for this niche

Nearly every commercial query in this niche is built from four blocks:

```
[STONE NAME or TYPE+COLOR] + [FORMAT] + [BUYER WORD] + [ORIGIN]
   tundra grey marble          slabs       supplier       turkey
```

Buyer words, ranked by intent strength (strongest first):
**price / price per m2 / price per square meter · buy · supplier · exporter ·
wholesale · factory · quarry · manufacturer · for sale · cost**

Format words: **slabs · tiles · blocks · cut to size · countertops ·
veincut / crosscut** (travertine-specific) · finishes: **polished · honed ·
brushed · tumbled · bush-hammered · sandblasted**

### 3.2 Tier 1 — Commercial stone names (transactional, ~150 pages ready)

These are actual trade names found in the specification corpus — each is a
proven, purchasable product buyers search by name. Bold = also in the DIJA
catalogue today (direct landing page exists):

| Stone family | Commercial names buyers search |
|---|---|
| Grey marbles | **Tundra Grey**, Pietra Grey, Bosphorus Grey, Savannah Grey, Silver Fantastic, Aqua Silver, Claros/Cralos Grey |
| Beige marbles | Burdur Beige, Lycia Beige, Silver Beige, Akhisar Beige, Platinium Beige, Imperial Brown, Tobacco Gold, **Crema Marfil** |
| White marbles | **Volakas (White)**, **Bianco Carrara**, **Calacatta Oro**, **Statuario**, Marmara White/Marmara Marble, Afyon White, Kemalpaşa White, Iceberg |
| Black marbles | **Nero Marquina**, **Absolute Black**, Toros Black, Adranos Black, Alexander Black, Nero Picasso |
| Green/colored | **Verde Serpentino**, Rustic Green, Elazığ Petrol Green, Elazığ Cherry, Afyon Lilac, Bumble Bee, Bruno Perla |
| Travertines | **Denizli Travertine**, Silver Travertine, White Travertine, Orange Travertine, **Travertine Classic/Silver Veincut** |
| Limestones | Limra (Limra Stone), Bodrum Stone, Urla Stone, Küfeki Stone, **Pietra Leccese** |
| Granites | **Black Galaxy**, **Blue Bahia**, Aksaray Yaylak, Nero Nebiyan, Metalicus |

**Query templates per stone** (each of ~150 material pages should be able to
rank for its own set):
- `{name} price` / `{name} price per m2`
- `{name} slabs` / `{name} tiles`
- `{name} supplier` / `{name} quarry`
- `buy {name}` / `{name} for sale`
- `{name} bookmatch` (high-value interior queries — the corpus shows
  "bookmatch covering" as a real specified application)

**Action:** material page titles/descriptions must contain the *name + type +
a buyer word + origin*. Current title "Tundra Grey" → better:
`Tundra Grey Marble — Slabs & Tiles, Price & Supplier | DIJA Natural Stone`.

### 3.3 Tier 2 — Category + origin (the head terms)

The realistic crown-jewel head terms for an Izmir-based exporter, by market:

- **turkish marble supplier** / **turkish marble exporter** / marble from turkey
- **turkish travertine** (+ supplier/price/pavers)
- **natural stone supplier turkey** / natural stone exporter
- **marble slabs wholesale** / wholesale marble prices
- **beige marble from turkey**, **grey marble slabs**, **white marble supplier**
- marble supplier **for architects** / **for hotels** / **for developers** (B2B modifiers with weak competition)
- **marble quarry turkey** (buyers wanting to verify factory-direct claims)
- Localized head terms once i18n URLs exist (competition drops massively
  outside English): *fournisseur marbre Turquie*, *marbre turc prix*,
  *مورد رخام تركي*, *رخام تركي*, *mermer ihracatçısı*, *доломит/травертин из Турции*

### 3.4 Tier 3 — Application keywords (commercial-informational hybrid)

Extracted from what architects actually specified in the corpus — these become
collection pages, journal posts, and filtered material listings:

- **floor**: marble floor covering, travertine flooring, lobby floor marble
- **walls**: marble wall cladding, exterior façade cladding stone, travertine façade
- **wet areas**: marble for bathroom walls, spa/hammam stone (a uniquely
  Turkish angle nobody owns yet: "**turkish bath marble**", "hammam marble")
- **kitchen**: marble countertops, kitchen island marble, monoblock marble sink
- **hospitality**: hotel lobby marble, reception counter/desk stone, bar counter marble
- **outdoor**: travertine pavers, pool coping stone, garden/terrace flooring, staircases
- **statement**: bookmatched marble, marble fireplace surround

### 3.5 Tier 4 — Informational (Journal fuel + backlink earners)

- travertine vs marble · marble vs porcelain · limestone vs marble
- how much does marble cost / marble price guide 2026
- veincut vs crosscut travertine · honed vs polished marble
- how to import marble from turkey (Incoterms explained) ← *matches our
  proforma feature perfectly; nobody has written this well*
- what is {calacatta / tundra / limra} · marble quarrying process
- famous buildings made of marble (Heritage page already targets this)

### 3.6 What NOT to chase
- "marble countertops near me" — US local retail intent we can't serve.
- Single words ("marble", "granite") — owned by Wikipedia/Home Depot.
- The `keywords` meta tag as a ranking lever — **Google has ignored it since
  2009** (video advice on this point is outdated; harmless to add, but never
  rely on it — put the words in title/description/body instead).

### 3.7 Keyword → page mapping

| Keyword tier | Landing page | Status |
|---|---|---|
| Tier 1 stone names | `/materials/{id}` | pages exist, titles need the formula |
| Tier 2 head terms | homepage, `/materials`, `/collections/*` | copy needs writing |
| Tier 3 applications | collections + journal + a new "applications" angle | partial |
| Tier 4 informational | `/journal/*` | engine exists, needs schedule |
| "{project} architect stone" long-tails | `/case-studies/*` | ✅ live |

---

## Part 4 — Next.js implementation checklist

*(Per-item mechanics per the Next.js SEO crash-course transcript, cross-checked
against Google documentation and our codebase. ✅ = already done in our repo,
🟡 = partial, ❌ = to do.)*

1. **Server components by default** — ✅ all public pages are server-rendered;
   client components are isolated leaf components (Gallery, buttons). Keep it
   that way: never put `"use client"` on a page, only on small interactive
   children.
2. **`metadata` / `generateMetadata` on every route, no exceptions** — 🟡
   all 24 page types export one, but most only set `title`. Every public page
   needs at minimum: `title`, `description`, `alternates.canonical`,
   `openGraph`; detail pages build them dynamically from DB fields (we already
   do this pattern in `materials/[id]` — copy it everywhere).
3. **Dynamic metadata for dynamic routes** — 🟡 exists on materials; roll the
   same `generateMetadata({params})` pattern (with a not-found fallback
   returning "Not found" metadata) to case-studies, journal, projects,
   collections.
4. **OpenGraph block** — ❌ site-wide. Set `title` (may be shorter/punchier
   than the SEO title), `description`, `url`, `siteName`, `locale`, `type`
   (`website` for pages, `article` for journal posts), and `images` (1200×630).
   We should generate a branded default OG image + per-stone OG images from
   the stone's cover photo. Test with opengraph.xyz after deploy.
5. **Twitter card block** — ❌. `card: "summary_large_image"`, title,
   description, image. One shared helper can emit both OG + Twitter.
6. **Per-page robots metadata** — ❌. Public pages: `index: true, follow:
   true`, plus `googleBot: { "max-snippet": -1, "max-image-preview": "large",
   "max-video-preview": -1 }` (large image previews matter for a visual
   product). Login/account/compare pages: `index: false`.
7. **`robots.ts` granularity** — 🟡 good baseline. Additions: consider
   disallowing legal pages (`/privacy`, `/terms`, `/cookies`) from wasting
   crawl budget, and add a rule blocking aggressive crawlers (e.g. `MJ12bot`)
   that burn server resources without value. Keep the `sitemap:` pointer (present ✅).
8. **`sitemap.ts` with lastModified / changeFrequency / priority** — 🟡 we
   set changeFrequency/priority; add real `lastModified` (stones already have
   `updatedAt` — use it on every entry type; falls back to build date). After
   the i18n migration, emit one entry per locale with `alternates.languages`.
9. **Canonical URLs on every page, always absolute** — ❌ (only materials).
   Static pages: hardcode `${SITE_URL}/path`. Dynamic: interpolate params.
   This also future-proofs against `?color=`-style filter params splitting
   ranking signals.
10. **JSON-LD structured data** (script tag `application/ld+json`,
    `JSON.stringify`, values only from our own DB — component already exists) —
    🟡 Product on stones. Add:
    - `Organization` in the root layout (name, url, logo, address, phones,
      `sameAs: []` social profiles),
    - `Article` on journal posts (headline, author, datePublished),
    - `BreadcrumbList` on all detail pages (we render visual breadcrumbs on
      materials already — mirror them in schema),
    - keep schemas registered on **valuable pages only** (products, articles,
      org) — not on login/account pages.
11. **Semantic HTML** — 🟡 we use `<nav>`, `<article>` on journal; sweep for
    remaining `<div>`s that should be `<header>`, `<main>`, `<section>`,
    `<figure>` — and ensure exactly one `<h1>` per page.
12. **Lighthouse as a routine** — ❌ not part of our workflow. Run DevTools →
    Lighthouse on homepage, one material, one case study after every
    significant change; fix SEO-category flags immediately (it catches things
    like an invalid robots.txt — the classic bug being a hardcoded/localhost
    base URL, which is exactly our risk #2).
13. **Base URL from environment** — ✅ pattern exists (`NEXT_PUBLIC_SITE_URL`)
    but ❌ unverified in production, and the localhost fallback makes failures
    silent. Consider failing the production build if it's unset.

---

## Part 5 — The action plan

### Phase 0 — Measurement first (~1 day)
1. Verify domain in **Google Search Console** + **Bing Webmaster Tools**;
   submit the sitemap. Free, and shows which queries you already appear for.
2. Confirm `NEXT_PUBLIC_SITE_URL=https://dijastones.com` in production
   (checklist #13). Add a build-time guard.
3. Add analytics (Plausible/Umami or GA4).
4. Create a **Google Business Profile** (Izmir address).
5. Validate the Part 3 keyword list against Keyword Planner data; mark the
   30 highest volume-to-competition terms as the priority set.

### Phase 1 — Technical foundation (~3 dev days)
Execute checklist items **2, 3, 4, 5, 6, 8, 9, 10, 11** across all 24 page
types (one shared metadata helper + one shared JSON-LD builder keeps this DRY).
Then:
1. Migrate public `<img>` → `next/image` (WebP/AVIF, dimensions → CLS/LCP).
2. Self-host fonts + Font Awesome subset (removes render-blocking 3rd-party requests).
3. Lighthouse before/after (checklist #12); target ≥90 mobile on the three
   representative pages.

### Phase 2 — On-page keyword alignment (~2 days, mostly copy)
1. **Homepage**: title →
   `Turkish Marble & Natural Stone Supplier | Wholesale Slabs, Tiles & Blocks — DIJA`;
   description with exporter/Izmir/worldwide/EXW-FOB; one crawlable intro
   paragraph using Tier 2 terms (visible text, not just meta).
2. **Materials pages**: apply the Tier 1 formula to titles/descriptions;
   ensure price-from, origin, finishes, formats appear in crawlable text.
   Add a "Seen in these projects" section linking to case studies featuring
   the stone (reverse link of what case studies already do).
3. **Materials list & Collections**: an intro paragraph each, written around
   Tier 2/3 phrases.
4. **Case studies / journal**: Article schema (Phase 1) + interlinks (done).

### Phase 3 — Indexable languages (~1 week, biggest single win)
Path-based locales (`/fr/…`, `/tr/…`, `/ar/…`; `/` stays English):
middleware maps prefix → locale (cookie becomes preference memory only),
`alternates.languages` hreflang on every page, sitemap × locales
(checklist #8), rollout order EN → FR → AR → TR. Multiplies the indexable
site ×10 in far less competitive SERPs.

### Phase 4 — Content & authority (ongoing, ~2 posts/month)
1. Journal on a schedule, from the Tier 4 list — starting with
   "How to import marble from Turkey: Incoterms explained" and
   "Travertine price guide 2026" (both map to real buyer pain and to
   features we already have).
2. An "applications" content angle from Tier 3: hammam/Turkish-bath stone,
   hotel lobby marble, bookmatched feature walls — queries with real
   commercial intent and no strong owner.
3. **Backlinks (white-hat only):** industry directories (StoneContact,
   Graniteland, Alibaba company page), Turkish exporters' association (İMİB),
   Tunisian trade bodies; pitch the case-study library + Heritage page to
   architecture publications; Google Business/Bing Places/Apple Maps.
4. Never buy links or mass-produce AI content — one core update wipes it out.

### Phase 5 — Monitor & iterate (monthly, 1 hour)
- GSC: impressions-but-low-CTR queries → rewrite those titles/descriptions.
- Positions 8–20 ("striking distance") → strengthen those pages with content
  and internal links.
- Keep Core Web Vitals green after each feature ships (checklist #12 routine).

---

## Expected timeline
Technical fixes surface in 2–6 weeks (recrawl), keyword-aligned pages in 2–4
months, language expansion 3–6 months, authority 6–12 months. Order matters:
measurement → technical → on-page → i18n → content, each phase multiplying
the next.

*Follow-up when web tooling recovers: pull live SERPs for the priority-30
keyword set to profile who currently ranks and what content gaps they leave.*
