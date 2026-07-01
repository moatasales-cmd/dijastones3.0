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
- [ ] **Phase 2 — Public catalogue.** Materials (grid+filters), material detail,
      collections, quarries, projects, journal, heritage, sustainability, contact.
- [ ] **Phase 3 — Accounts.** Register / verify / login (password+code+Google),
      dashboard, profile completion, favorites.
- [ ] **Phase 4 — Proforma & trade.** Proforma builder (incoterms, ports,
      container calc, shipping), PDF export + email, trade applications, leads.
- [ ] **Phase 5 — Admin CRM.** Secure admin: stones, clients, leads, proformas,
      posts + analytics.
- [ ] **Phase 6 — Upgrades.** Faceted search, image uploads+optimization,
      proforma status tracking, comparison tool, SEO/structured data, security.
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
