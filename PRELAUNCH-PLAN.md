# DIJA — CEO Pre-Launch Review & Upgrade Plan

*Written as a full pass over the site as it stands today, with the eyes of someone who has
bought, sold, crated and shipped stone for years. Nothing in this document has been built
yet — it is the marked-up map of what changes before we go live.*

**How to read the priorities:**
- **P0 — launch blocker.** We do not go public until this is fixed. Most are trust, legal, or money-path issues.
- **P1 — fix in the first sprint after P0s.** Hurts credibility or conversion, but won't sink us on day one.
- **P2 — post-launch roadmap.** Real improvements, wrong time.

---

## 1. The single biggest risk: we are publishing fiction

A stone buyer worth having — an architect, a GC's procurement lead, a Gulf villa developer —
does two things within five minutes of landing on a supplier site: they google our projects,
and they sanity-check our numbers. Right now both checks fail.

### 1.1 The portfolio is invented — P0
`prisma/seed-data/projects.json` ships 11 landmark projects with named clients, architects,
tonnages and years: *Cala Luna Pavilion (Sardinia), Villa Aequora, Museum of Aegean Antiquity,
Maison Lazare Flagship, Bryant Park Tower Lobby, Hotel Sirenian Maldives, Dubai Operatic Foyer,
The Toronto Reserve, Al Saraya Majlis, Villa Capri East Hampton, Istinye Residence.*
None of these will survive a Google search. In B2B stone, one discovered fake project poisons
every true claim on the site.

**Decision:** before launch, the Projects section becomes one of:
1. **Real supply references** — even modest ones. "600 m² Burdur Beige, boutique hotel, Jeddah, 2024"
   with real photos beats a fake museum. Rename the section "Selected Supply References."
2. **Hidden at launch** — remove from nav until we have 3 real case studies with client permission.

Same treatment for the homepage testimonial (`home.quote_text`, attributed to
*"Studio Mareterra · Architects · Cagliari"*) and the featured project block (*Cala Luna, 84 tons
of Thassos, "every panel book-matched by hand"*). Fictional testimonial = P0 removal. Replace
with a real quote (even from a small repeat buyer) or run the section without attribution as a
brand statement.

### 1.2 The numbers don't agree with each other — P0
A single afternoon of cross-reading finds these contradictions:

| Claim | Where | Conflict |
|---|---|---|
| "Family-owned, Izmir-based **since 1995**" | `meta.description`, footer tagline | Heritage story says the business started **2017** |
| "**A Decade** of Curating the Earth" | heritage section | 2017 → today is 9 years; and "since 1995" says 30 |
| "**Six offices** and four trusted partners across nine countries" | contact hero | Catalogue says "**Five offices** across three continents"; heritage names HQ İzmir + Canada, Italy, Qatar, Tunisia |
| "**500+** Trade Partners" | trade page (hardcoded) | Unverifiable; trade philosophy text says we'd "rather work with fifty partners" |
| "**47** Countries Shipped" | home + trade (hardcoded) | Unverifiable at our stage |
| "delivered to 47 countries **without a single broken slab**" | home process | Every stone veteran knows breakage happens. Pros read this as marketing fluff — it lowers trust with exactly the audience we want |
| "**15%** Avg. Trade Savings" | trade page (hardcoded) | Savings vs. what baseline? Meaningless and challengeable |
| Sustainability milestones **2015 → 2026** | sustainability page | 2015 milestone predates the 2017 founding; "blockchain traceability pilot" (2024) and "net-zero pathway published" (2026) are aspirational fiction — in the EU this is legally risky greenwashing, not just fluff |
| "30+ Partner Quarries" | quarries page (hardcoded) | Fine **if true** — verify or adjust |

**Decision:** create one **facts sheet** (a short internal doc, later a `config/facts.json` the
site reads from) listing every number we publish, each marked *verified / adjusted / removed*.
Rules going forward: no future-dated milestones, no stats we can't defend in an email to a
skeptical buyer, and the same number appears identically everywhere. My recommendation for
launch honesty: real founding year, real office/partner count, drop "47 countries / 500+
partners / 15% savings / zero breakage" entirely, and cut the sustainability timeline down to
the 3–4 things we actually do (sea freight, closed-loop water at partner facilities we can
name, waste reuse) with no certification claims we don't hold.

### 1.3 The story (Heritage) — keep it, fix it — P0 for dates, P1 for depth
You gave me license to change even the personal story. My call as CEO: **the Khadija story
stays.** It is the single most differentiated asset on this site — family, word-as-bond,
Mediterranean roots. It resonates precisely with GCC family businesses and European
architects alike. What changes:

- **Fix the chronology** to one truthful timeline (family roots → 2017 trade entry → 2022
  Tunisia → today). Kill "since 1995" or reframe it explicitly as family roots, not company age.
- **Put real faces on it.** Add the founders — names, one photograph, one line each. Anonymous
  "our founders" storytelling reads like copywriting; named people read like a company. B2B
  buyers wire 30% deposits to people, not prose.
- **Soften unverifiable glamour**: "luxury resorts in the Maldives, exclusive villas throughout
  the GCC" — keep only what we can evidence; otherwise "private residences and hospitality
  projects across the Mediterranean and the Gulf."
- Tighten the Genesis section ~30% — it's beautiful but long; architects skim.

---

## 2. The money path (this is where deals die) — P0

### 2.1 Invoice identity mismatch
The proforma — our only legal-ish document — currently says:
- **Seller:** DIJA Natural Stone, AOSB Çiğli, İzmir, **Türkiye** (+90 phone)
- **Bank:** Zitouna Banque, **Tunis**, IBAN TN59…, beneficiary "**STE Dija Marble**"
- **Tax ID: 123-456-7890** ← a literal placeholder on a payment document

A buyer's bank compliance desk sees: Turkish seller, Tunisian account, third company name,
fake tax ID. That's a wire-fraud pattern. Nobody's finance department clears that payment.

**Decision:** pick the invoicing legal entity (TR or TN — whichever actually holds the export
paperwork and the account), then make **seller name, address, tax/VAT number, bank, and
beneficiary all match that one entity** on the proforma, the PDF, and `config/bank.json`.
If we genuinely operate two entities, the proforma must clearly state which entity contracts
the sale. Real tax ID before anything goes public.

### 2.2 Proforma = quotation, not a payment request
Today a client can self-generate a proforma with our bank details and a 30% advance line, at
prices computed from config-file freight rates that will be stale within a month.

**Decision:**
- A client-generated proforma is a **draft quotation**. Bank details and the 30/70 payment
  schedule appear only after an admin marks it **confirmed** (we already have a status field —
  the workflow exists, we gate the sensitive block on it). Until then the document carries
  "Indicative quotation — not a payment request. Payment details follow written confirmation."
- Admin gets an email notification on every new proforma (sales follow-up within the 4h we promise).
- Freight rates (`config/shipping.json`) get an **owner and a review cadence** (monthly, logistics).
  Rates carry a "last reviewed" date shown on the proforma.

### 2.3 Incoterms discipline
We currently offer all ten incoterms including **DDP** — meaning we'd owe import clearance and
duties in the buyer's country. No small exporter should promise DDP self-serve.
**Decision:** launch with **EXW / FCA / FOB / CFR / CIF** only. DAP/DDP by negotiation, off-tool.

### 2.4 Logistics sanity sign-off
Container math (450/300/900 m² per 20ft by thickness) is roughly weight-consistent (~24t), but
a 20ft payload limit is ~26–28t and slabs on A-frames pack differently from crated tiles.
**Decision:** logistics review signs off `config/sizes.json` capacities and every zone rate
before launch. One overweight container at the port costs more than this whole review.

---

## 3. Identity & contact hygiene — P0

- **One brand name.** We are "DIJA Marble" (logo, footer, copyright), "DIJA Natural Stone"
  (everywhere else), and "STE Dija Marble" (bank). **Decision: "DIJA Natural Stone"** as the
  public brand (matches dijastones.com, covers granite/limestone/travertine — we outgrew
  "Marble"), legal entity name only on legal lines.
- **Email addresses.** We publish `info@`, `contact@`, `sales@`, `trade@dijastones.com` — and the
  privacy policy says `info@dijastone.com` (missing "s" — typo pointing at a domain we may not
  own; that's a data-leak vector). **Fix the typo; verify all four mailboxes exist and are
  monitored, or collapse to two (info@, sales@).**
- **Phones.** Site phone is +90 232 556 12 00 (İzmir); the WhatsApp float is **+216 54 795 883
  (Tunisia)**. Both must be real, answered, and consistent with whichever entity fronts the
  site. WhatsApp is our highest-intent channel in this trade — it must land with a person.
- **Copyright** "© 2025" → dynamic year. Privacy "Last updated: January 2025" → real date after
  the legal review below.
- **Office list** (contact page pulls from DB): audit every office/partner row against reality —
  address, phone, actual role. If Canada/Italy/Qatar are representatives, say "representative,"
  not "office."

---

## 4. Legal & compliance — P0/P1

- **P0:** real Tax/VAT ID on documents (§2.1); privacy-policy email typo; align the T&C tolerance
  and insurance percentages with what we actually offer.
- **P1:** have a lawyer pass over privacy/terms/cookies for **KVKK** (Turkey) and **GDPR** (EU
  buyers) — we collect names, emails, phones, and business data across 10 locales. The cookie
  policy's "minimal cookies" claim is currently true (session + lang) — keep it true when
  analytics arrive by choosing a cookieless analytics tool (see §8).
- **P1:** sustainability page legal scrub (EU green-claims exposure, §1.2).
- **P2:** export-control boilerplate and sanctions-screening note in T&C (we sell into the Gulf,
  Russia locale exists — sales should know the screening basics).

---

## 5. Product data & content quality — P1

- **Stones without photos:** some stones have empty galleries (known carry-over). A price list
  without a photo sells nothing. Pre-launch: count them (script exists — `audit-stones.ts`
  pattern), either photograph/source imagery or hide imageless stones from the public grid.
- **Re-run the spec audit** (`prisma/audit-stones.ts`) as a launch gate — it was clean at 152
  stones / 0 issues; keep it that way after any data edits.
- **Journal:** seeded posts need the same fiction-check as projects. Real field notes only —
  even two honest posts beat ten invented ones. Set a cadence we can hold (quarterly, matching
  the newsletter promise).
- **Newsletter promise** ("Quarterly notes. No promotions, ever.") — I like it; it's a brand
  position. But it's a promise: put it in the marketing calendar so we actually send quarterly.
- **Response-time promise** ("within 24 hours, typically 4 hours during business hours") — only
  keep if someone owns the inbox during İzmir business hours. Otherwise soften to "within one
  business day."

---

## 6. Website UX gaps — P1

- **Proforma builder is hardcoded English** (`components/ProformaBuilder.tsx` ignores the i18n
  system). Our highest-value tool is untranslated in 9 of our 10 languages — including Turkish
  and Arabic, our two home audiences. Wire it to the existing `proforma.*` keys (they're already
  translated in all 10 files).
- **Google sign-in button** is visible but non-functional (no GOOGLE_CLIENT_ID). Hide it until
  configured — a dead login button on the first screen a client sees is amateur hour.
- **RTL depth:** Arabic baseline works (dir flips, nav, dropdowns) but the hand-authored CSS is
  physical-property based; do a page-by-page RTL visual pass on the 6 money pages (home,
  materials, material detail, proforma builder, contact, trade) and patch the worst offenders.
- **Arabic flag icon:** the language switcher renders the shahada text inside a tiny SVG flag —
  religiously sensitive and unreadable at 18px. Replace with a neutral "ع" glyph or a generic
  script badge. (Small thing; exactly the kind of small thing a Gulf buyer notices.)
- **Phone dial-code picker** was simplified to a plain field (known deferral) — fine for launch;
  revisit P2.
- **Accessibility quick pass:** focus states, alt text on stone images, form labels. One
  afternoon, real ROI with EU corporate buyers whose procurement checks WCAG boxes.

---

## 7. Localization strategy — P1

Ten languages is a real asset now. Three gaps:

1. **Native review before launch** for the two languages where we cannot afford a single false
   note: **Turkish** (home market — staff can proofread) and **Arabic** (GCC buyers — pay a
   professional reviewer for one day). Machine-authored copy is good; native-checked copy is credible.
2. **Locale is cookie-based** → search engines only ever see English. Post-launch (P2), move to
   path-based locales (`/tr/...`, `/ar/...`) with `hreflang` so Turkish and Arabic buyers find
   us in their language. This is an SEO project, not a launch blocker — but it's where the
   organic growth is.
3. **Catalogue & datasheet PDFs** already read i18n keys — verify they actually render localized
   end-to-end and add the locale to the print header. (Proforma stays English-only by design — correct call for an export document.)

---

## 8. Analytics, ops & security — P0 gate before DNS points anywhere

| Item | Status | Action |
|---|---|---|
| Admin credentials | default `admin/dija2025` in .env | **P0** — strong unique creds |
| AUTH_SECRET | insecure default fallback | **P0** — real secret in prod env |
| SMTP | unconfigured (emails log to console) | **P0** — no email = no verification codes, no proformas, no leads. Configure transactional email (SES/Postmark/etc.), SPF+DKIM on dijastones.com |
| Database | SQLite file | **P0** — Postgres in production (adapter already planned), automated daily backups |
| Error monitoring | none | **P0** — Sentry or equivalent; we cannot fix what we can't see |
| Analytics | none | **P0** — cookieless tool (Plausible/Fathom) to keep the cookie policy honest; track: proforma started/completed, quote requests, trade applications, catalogue downloads |
| Rate limiting | verification codes only | **P1** — add to contact/quote/trade/newsletter APIs (bot spam is guaranteed) |
| Staging environment | none | **P0** — staging URL, then production behind the real domain with SSL |
| Lead routing | DB rows only | **P0** — every contact/quote/trade submission also emails sales@ in real time. Leads that sit in an admin table for three days are dead |

---

## 9. What we deliberately do NOT change

- **Public indicative pricing.** Controversial in this industry — most suppliers hide prices.
  We keep them public: it pre-qualifies leads, filters tire-kickers, and signals the
  transparency the whole brand stands on. Labeled ex-works and indicative, which it already is.
- **The proforma builder concept.** Self-serve quoting is genuinely ahead of this industry.
  We're gating the payment details (§2.2), not the tool.
- **The design language.** The editorial, geology-forward tone is right for the architect
  audience. No redesign.
- **The Khadija story** (§1.3). Fixed, named, and kept.

---

## 10. Launch sequence

1. **Week 1 — Truth & money:** facts sheet; fiction purge (projects/testimonial/milestones);
   heritage timeline fix; invoice entity + bank + tax ID alignment; proforma confirmation
   workflow decision; incoterm restriction.
2. **Week 2 — Hygiene & ops:** brand name unification; email/phone cleanup; ops table in §8
   (SMTP, Postgres, secrets, monitoring, analytics, staging); lead email routing.
3. **Week 3 — Quality:** stone photo audit; builder i18n; TR/AR native review; RTL money-page
   pass; legal review of policies; hide Google button; logistics sign-off on rates.
4. **Soft launch:** share staging with 5–10 friendly trade contacts, watch analytics + Sentry
   for two weeks, fix what they trip over.
5. **Go live.** Then: hreflang/path locales, real case studies as they close, dial-code picker,
   trade-account gated pricing tier.

### P0 gate — must all be green before public DNS
- [ ] No fictional projects, testimonials, or milestones anywhere on the site
- [ ] Every published number on the facts sheet, verified
- [ ] One timeline in the story; founders named
- [ ] Invoice: one entity — name, address, real tax ID, bank, beneficiary all matching
- [ ] Proforma gated as quotation until confirmed; sales notified on creation
- [ ] Incoterms restricted to EXW/FCA/FOB/CFR/CIF
- [ ] Privacy email typo fixed; all published mailboxes live
- [ ] WhatsApp + phone answered and consistent
- [ ] SMTP, Postgres + backups, real secrets, Sentry, analytics, staging
- [ ] Lead submissions email sales@ in real time

---
*Nothing above has been implemented. Each section becomes its own work order once we agree the decisions.*
