# DIJA Natural Stone — Rebuild Plan (Next.js 16)

Rebuild of the original PHP site (`D:\dija-2.2`) as a modern Next.js app,
**copying the UX/UI 1:1** while upgrading the architecture and features.

## Stack (decided)
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** available for new UI; the original hand-authored CSS
  (`styles/app.css`, `auth.css`, `proforma.css`) is carried over intact and
  owns the site's look (design tokens + light/dark themes).
- **Database**: PostgreSQL + Prisma (SQLite for local dev) — migrated from the
  old `data/*.json` files.
- **Auth**: Auth.js (email+password, email code, Google) + hashed admin role.
- **i18n**: next-intl (EN/FR) migrated from `lang/*.php`.
- **PDF**: React-PDF / Puppeteer (replaces mPDF). **Email**: Nodemailer/Resend.

## Design tokens (preserved)
- Fonts: Playfair Display (serif headings) + Outfit (body)
- Navy `#13172C` · browns `#915D36` / `#A38978` · light + dark themes

## Phases
- [x] **Phase 0 — Scaffold & shell.** Next.js project, design system ported,
      fonts, light/dark theming (no-flash), glass header + nav dropdowns +
      mobile drawer + theme toggle, footer, scroll-reveal, home page. ✅ verified
- [x] **Phase 1 — Data + i18n.** ✅ Prisma+SQLite schema, migrated all
      `data/*.json` → DB (seed script), EN/FR messages converted from
      `lang/*.php` (1365 keys each), lightweight cookie-based i18n faithful to
      the old `__()` (flat keys, `%s` args). Home + shell fully bilingual.
      Note: used a custom i18n helper instead of next-intl because the source
      uses flat dotted keys where a value and a namespace share a prefix
      (`nav.stone` vs `nav.stone.materials`), which nested-JSON libs can't hold.
- [x] **Phase 2 — Public catalogue.** ✅ Materials (grid+search/sort/filters/unit
      toggle), material detail (gallery+lightbox, pricing, specs, related),
      collections + detail, projects + detail, journal + article, quarries
      (accordion), heritage, sustainability (pillars), contact (offices/partners,
      Leaflet map, working contact form → /api/contact). Bilingual throughout.
      Titles with inline markup rendered via rich() helper.
- [x] **Phase 3 — Accounts.** ✅ Register → email code → verify, password login
      (+ email-code login), logout, protected routes. Session = signed JWT cookie
      (jose); passwords bcryptjs (verifies old PHP $2y$ hashes). Dev email logs
      the code to the server console (no SMTP needed locally). Client dashboard
      (/account): profile-completion meter, inline profile editor, favorites,
      activity log. Favorites sync localStorage → account on login. Header shows
      "My Account" when signed in. Google route built (needs GOOGLE_CLIENT_ID to
      activate). Verified end-to-end in the browser.
- [x] **Phase 4 — Proforma & commerce.** ✅ Lead forms wired: newsletter, quote
      modal (material detail), trade application (/trade). Proforma builder
      (/proforma, login-gated): live pricing engine (thickness/finish/grade
      multipliers), 20ft container packing, shipping zones by country, incoterms +
      payment terms, live totals → saves to DB. Invoice view (/proforma/[id]) with
      print-to-PDF; proformas list (/account/proformas). Verified e2e. Simplified
      vs original: plain phone (no dial-code picker), browser print-to-PDF instead
      of mPDF, single-page builder (not 4-step wizard), builder labels English (not
      yet i18n). Deferred: per-stone datasheet PDF + catalogue PDF (placeholder links).
- [x] **Phase 5 — Admin CRM.** ✅ Secure admin (env credentials + signed
      `dija_admin` JWT cookie, replacing hardcoded login). Restructured public
      site into `app/(site)/` route group (own layout w/ header/footer); root
      layout minimal so `/admin` has its own chrome. Admin (Tailwind UI):
      dashboard (counts + recent leads), stones list + editor (create/edit,
      verified live-reflect on site), clients, leads (contacts/quotes/trade),
      proformas, journal posts list + editor. tsc clean, verified e2e.
- [x] **Phase 6 — Upgrades.** ✅ SEO: `/sitemap.xml` (193 URLs, DB-driven),
      `/robots.txt` (blocks /admin,/api,/account,/proforma), per-material
      canonical + OpenGraph metadata, JSON-LD `Product` schema (price, brand,
      country) on every material page — verified valid JSON + correct fields.
      Comparison tool: `lib/compare.ts` (localStorage, max 3), compare toggle on
      grid cards + detail page, floating `CompareBar`, `/compare?ids=a,b,c` page
      with a side-by-side spec table — verified e2e including empty/invalid-id
      states. Proforma status tracking: admin dropdown (draft/sent/accepted/
      declined/expired) → `PATCH /api/admin/proformas/[id]`, reflects instantly
      in both admin and the client's own proforma list — verified. Fixed
      deferred PDF buttons: per-stone `/materials/[id]/datasheet` and full
      `/catalogue`, both print-to-PDF pages (same pattern as the proforma
      invoice) — replaces the old dead `/api/datasheet` and `/api/catalogue`
      links. Bug fix: `materials.catalogue_stats` was duplicating its own text
      (passed the whole phrase as the `%s` arg instead of just the count).
      tsc clean; all features verified in the browser.
- [x] **Phase 6b — Real catalogue + datasheet PDFs.** ✅ Replaced the placeholder
      print pages with faithful ports of the original PHP documents.
      `/catalogue` = full 166-page A4 catalogue (cover, why-DIJA, about, contents
      index, per-type sections, 152 product pages, application-matrix / care /
      sourcing reference pages, back cover); print CSS ported verbatim (4
      colliding classes prefixed + scoped under `.catdoc`, inline `<style>`).
      `/datasheet/[id]` = 2-page A4 spec sheet (hero, identity stripe, technical
      specs with lbs+psi+Mohs conversions, application matrix, per-type
      limitations, formats, gallery). Both have the image-preload progress overlay
      + floating "Save as PDF" + EN/FR switch (`PrintLoader`). Prose from the
      migrated `catalogue.*`/`datasheet.*` i18n keys (245+98, both languages).
      Moved out of `(site)` so they render standalone (root layout, no
      header/footer). Added HTML-entity decoding to the translator (source strings
      used `&amp;`/`&mdash;`/… that React rendered literally) — fixes the whole
      site. Data in `lib/catalogue.ts` + `lib/datasheet.ts`; `svgPlaceholder`
      ported. Country-origin maps were dead code in the original, so omitted.
- [x] **Expert content + dev audit pass.** ✅ COMPLETE — committed as 05a179f.
      All verified: audit 152 stones / 10 countries / 0 issues; tsc clean; first
      production build green (50 routes); all changed pages 200, unknown → 404. As stone-industry expert: (1) ~51 slip-resistance labels
      corrected in seed data — "Wet 9–15 (honed)" relabeled "(polished)"; wet ≤15
      is a polished figure, honed marble tests ~35–47 wet. (2) Added full Iran
      quarry profile (EN+FR i18n: geology/extraction/blocks/ports/note +
      country_iran + type_onyx + region_zagros_belt) — catalogue has ~10 Iranian
      stones but the sourcing page omitted Iran and claimed "9 countries".
      (3) Stats made data-driven: home (stone+country counts), quarries stats,
      catalogue about/sourcing facts (countries, offices, office-city list, HQ
      address from DB). (4) Corrected: "3 continents"→4, "170+ Pages"→"160+",
      catalogue HQ block showed Izmir factory address though HQ is Istanbul,
      office list omitted Istanbul (6 offices not 5). (5) Languedoc Jaune/Rouge
      had soft-limestone specs under type Marble (2,200 kg/m³ / 3.0% / 45 MPa) —
      corrected to real compact-marble figures; ages fixed to Devonian (~380 Ma,
      Montagne Noire — Rouge de Caunes); Griotte Rouge age also → Devonian.
      (6) Restored `dm` (dolomitic) field dropped in the Phase-1 migration —
      schema + seed.ts updated; 6 Greek whites carry it. Dolomite badges staged
      in material detail + catalogue product page + datasheet (defensive
      `(s as {dm?:boolean}).dm` casts — compile-safe before AND after the
      migration; grid-card badge deferred, needs `dm: true` in select lists
      post-generate). Added missing `catalogue.product.dolomite` i18n key (EN+FR).
      (7) "Balmoral Red" claimed as Brazilian — Balmoral Red is the famous
      Finnish rapakivi; the record's description/origin match Brazil's red
      granite, so renamed to **Brasília Red** (id `brasilia-red`; no other
      references existed). (8) **Fantasy Brown** retyped Quartzite → Marble
      with `dm: true` and a disclosure description — it's the trade's most
      notorious misnomer (hard dolomitic marble sold as quartzite).
      As senior dev: built /privacy /terms /cookies (footer linked them but they
      404'd — one dynamic [legal] route, bilingual), branded 404 (app/not-found)
      + error page (app/error), security headers in next.config.ts, metadataBase,
      robots now also disallows /datasheet + /compare. Wrote prisma/audit-stones.ts
      (per-type spec-range validator) + prisma/fix-content.ts + admin-gated
      /api/admin/fix-content.
      All follow-ups executed (user ran commands during a tool outage; helper
      scripts run-checks.cmd / commit-audit.cmd, gitignored). Audit validator
      ranges tuned against the reviewed catalogue (dense limestones 0.1%,
      Makrana 0.04%, syenite-granites 2,540 kg/m³, Turkish beiges 55 MPa).
      Remaining nice-to-have: dolomite badge on grid cards (add `dm: true` to
      the card select lists + CardStone type — client is generated now).
- [x] **Mobile menu + My Account overhaul + admin stone delete.** ✅
      **Mobile menu bug fixed:** the `.mobile-nav-parent.open` class (which the
      stylesheet's `max-height` transition depends on) was being applied to a
      wrapper `<div>` instead of the parent element the CSS selector targets —
      submenus (Stone/Atelier/Trade) rendered but stayed permanently
      `max-height:0`, so items existed in the DOM but weren't visible/tappable.
      Verified end-to-end: open menu → expand Stone → tap Materials → navigates.
      **My Account overhaul:** `AccountNav` tab bar (Dashboard / My Proformas /
      New Proforma / Sign Out) on every account page; dashboard now shows a
      "Recent proformas" widget (up to 3, with total count + "View all" link)
      pulling live from the DB; full proformas list unchanged but now reachable
      from every account page. Favorites are individually removable via
      `RemoveFavoriteButton` → `POST /api/favorites {remove}` (a new explicit
      removal branch, safer than the old add/remove toggle for a one-way
      "remove" action) — verified add/remove round-trip. `FavoritesSync`
      mirrors the account's server-side favorites into localStorage on
      dashboard load, so heart icons across the site match after signing in
      on a new device/browser.
      **Admin stone delete:** `DELETE /api/admin/stones/[id]` (admin-gated,
      cleans up favorites referencing the stone first, no FK on Favorite→Stone)
      + `DeleteStoneButton` (confirm dialog) wired into both the stones list
      and the editor page. Verified: create → list → delete → gone, 152/152
      real stones intact.
      **Dev fixes found during the mobile sweep:** (1) Tailwind `space-x-3` in
      `/admin/stones`' action column rendered with a 0px gap — Tailwind v4
      wraps `space-x`'s child-margin selector in `:where()` (zero specificity,
      intentionally overridable), and the site's global `* { margin: 0 }` reset
      (imported for the whole app, admin included) has equal specificity and
      comes later in the cascade, so it won. Fixed by switching to `inline-flex
      gap-3` (gap isn't margin-based, the reset can't touch it) — same fix
      applied to the admin sidebar's `space-y-1`. (2) The proforma builder's
      item-row was a fixed 6-column CSS grid (`2fr 1fr 1fr 1fr 1fr auto`) with
      no responsive fallback — every field squeezed to ~30px wide and became
      illegible below ~860px. Moved the layout from an inline style to
      `styles/proforma.css` with a `@media (max-width: 860px)` rule that
      stacks fields to full-width with mobile-only labels (`.pf-item-field-label`,
      hidden on desktop). Verified both breakpoints via computed field widths.
      Everything else checked and confirmed already working: quote modal,
      materials search/filter, quarries accordion, contact form + map, desktop
      nav dropdowns, compare page's horizontal-scroll table, all admin list
      tables (already `overflow-x-auto`-wrapped). tsc clean, production build
      green (51 routes).
- [x] **Fixed a real crash: viewing legacy proformas.** ✅ Caught via server
      error logs during the mobile sweep (not visible from the UI — the invoice
      page threw before rendering). All 9 proformas migrated from the old PHP
      site's `data/proformas.json` use different item field names than the new
      builder (`stone_name`/`area_m2`/`adjusted_unit_price`/`line_total` vs
      `stoneName`/`area`/`unitPrice`/`lineTotal`) — opening any of them on
      `/proforma/[id]` crashed with `Cannot read properties of undefined
      (reading 'toLocaleString')`. Added `normalizeItem()` in that page to read
      either schema. Verified against all 9 real legacy records (script-checked)
      plus one full browser render of a genuine $21,915 customer order.
- [x] **Reworked the proforma builder + invoice back to (and beyond) old-site
      parity.** ✅ User reported the rebuilt proforma had regressed: no tile
      size selection, no stone image on selection, and the finished document
      was missing incoterm/bank/payment-terms detail entirely. Root cause:
      the first Next.js pass reimplemented the builder from scratch instead
      of porting the old PHP/JS system (`assets/js/proforma.js`,
      `inc/incoterms.php`), losing most of its depth.
      **New shared engine** `lib/proforma-engine.ts` — ported directly from
      the old site: 10 size categories (mosaic → jumbo slabs → custom) each
      with per-size available thicknesses and a category multiplier; full
      Incoterm list (10, with buyer/seller responsibility + risk-transfer
      text) and cost matrix (which of 8 cost legs — packing/inland/customs/
      loading/freight/insurance/import/delivery — apply per incoterm); 3
      payment terms with a 30/70 advance/balance split. Corrected a pricing
      misunderstanding while porting: grade (Standard/Premium) selects an
      absolute price (`p` vs `pPremium`), it is **not** an extra multiplier —
      confirmed against `proforma.js` line 628/718 by hand. `computeItem()`
      is called identically client-side (live preview) and server-side (save),
      so what the client sees always matches what's persisted.
      **Rebuilt `ProformaBuilder.tsx`** using the old site's existing `.pi-row`
      CSS (never removed, just unused): stone select now shows a live
      image/type/origin/grade-price preview; category → size → thickness
      selects cascade properly again; full incoterm and payment-term selects
      with live description panels; destination country → port cascade;
      summary shows the real per-incoterm cost breakdown, not a flat number.
      **Save API hardened**: `POST /api/proforma` now looks up every stone's
      real price/name/image server-side by ID — the client only ever sends
      `stoneId` + selection fields, never a price, closing a trust gap.
      **Rebuilt the invoice page** (`/proforma/[id]`) via a new shared
      `lib/proforma-view.ts` normalizer (handles old/new/legacy item field
      names so nothing already saved breaks): logo header, seller/buyer grid,
      incoterm detail, container-requirements box, items table with stone
      photos, cost breakdown, totals, **Payment Terms** section (30/70 split
      + accepted methods), **Bank Details** section (from `config/bank.json`),
      full 8-paragraph Terms & Conditions, footer.
      **New: real "send as PDF" email.** Old site only had a client-side
      `mailto:` link — never actually sent anything. Built `lib/proforma-pdf.tsx`
      (`@react-pdf/renderer`) rendering the same `buildInvoiceView()` data as
      the on-screen page, and `POST /api/proforma/[id]/send`, which generates
      the PDF and emails it (via the existing `lib/mail.ts`, extended to
      support attachments) to the signed-in client's own address. Wired to a
      new "Send to my email" button next to Print. Verified end-to-end in the
      browser: clicked send → server logged a dev-mode email with a real
      9.5 KB PDF attachment, correct grand total and buyer name. Also verified
      the reworked invoice page against a genuine legacy PHP-migrated
      proforma (temporarily reassigned, checked, reverted) — renders with no
      crash and full bank/incoterm detail. `tsc --noEmit` clean, production
      build green (56 routes).
- [x] **Proforma editing + fixed a real "blank size" data bug.** ✅ Added
      client-side editing: any proforma still `draft` gets an Edit button
      (`/proforma/[id]/edit`) that prefills `ProformaBuilder` from the saved
      record and PATCHes `/api/proforma/[id]` instead of creating a new row.
      Create and edit now share one pricing pipeline (`lib/proforma-save.ts`)
      so both are priced identically server-side. While wiring this up, found
      a live customer proforma (`DIJA-20260702-1CE82C`) saved with `size_label:
      "—"` and `width_cm/height_cm: 0` — root cause: imperial category ids
      (`tiles-medium-imperial` etc.) never matched `CATEGORY_BY_ID` (built from
      the metric list only), and even once matched, imperial sizes store
      `w_in`/`h_in` (inches) while every downstream calc expects cm — so any
      proforma built in ft² mode silently lost its size/dimensions. Fixed by
      merging both unit lists into one lookup and converting inches→cm at
      config load time in `lib/proforma-engine.ts`. Also removed a latent
      duplicate "Custom Size" dropdown entry (config's own inert custom
      placeholder rendering next to the builder's real one). Verified live in
      the browser: built a fresh ft² proforma (20×20 in → correctly stored as
      50.8×50.8 cm), edited it (prefilled size/thickness/area matched exactly),
      changed the area, saved, and confirmed the grand total updated in place
      (same proforma id, not a new one). Pre-existing broken legacy items
      (`width_cm: 0`) can't be recovered automatically — the original size
      selection was already lost when they were first saved — but they can
      now be fixed by opening them in Edit and reselecting a size.
- [ ] **Phase 7 — Polish & deploy.**

## Notes / carried-over quirks to fix during migration
- `data/posts.json` has a UTF-8 BOM that breaks strict JSON parsers — strip on import.
- Old admin login was hard-coded `admin`/`dija2025` — replace with hashed auth.
- Some stones have no gallery images (`g` empty) — the old app generated
  placeholders via `placeholder.php`; needs a Next equivalent.

## Run locally
```
cd D:\dija-next-3.0
npm run dev        # http://localhost:3000
```
Original site kept untouched at `D:\dija-2.2` for reference.
