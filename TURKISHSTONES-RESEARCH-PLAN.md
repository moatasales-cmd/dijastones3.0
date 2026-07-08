# What turkishstones.org has, and what's worth taking from it

## Context first: who runs that site

`turkishstones.org` is **not a competitor** — it's a national industry-promotion
site run by three Turkish exporters' associations (İMİB, EİB, BAİB). Its job is
to promote *Turkey's stone industry as a whole* to architects and buyers
worldwide, not to sell stone directly. That matters for what we borrow:

- Its statistics ("Turkey is the #1 marble/travertine exporter", "$18B world
  imports") are aggregate national figures — **not DIJA's own numbers**. We can
  cite them as sourced industry context, but must never phrase them as if
  they're DIJA's personal achievement.
- Its scale (80+ stone types, dozens of live architect-credited projects, a
  video library, a press office) reflects an association's budget and mandate,
  not a single family atelier's. Some of what it does isn't proportionate for
  us to replicate — flagged below.

Structure of the site, for reference:
`About Us` · `Stones Index` (filter by type/color/keyword + map view) ·
`Inspire` → `Projects` + `Talks` · `News & Events` · `Library` → `Videos` /
`Publications` / `Press Releases` · `Contact`.

---

## P0 — worth doing now (content-only, fits our existing pages)

### 1. "Common Characteristics of Turkish Stone" style trust section on Materials
Their Stones Index has a short, plain-language trust block: Quality (free of
cracks/defects), Color (wide range), Sizes (yields big blocks), Uniformity
(consistent quality), Pattern (decorative composition). We have no equivalent
on `/materials` — it's a cheap, high-value addition that answers the "why
trust this supplier" question right where someone is browsing. I'd write
DIJA's own version of this (our own wording, our own claims) rather than
their exact copy.

### 2. Real, cited industry statistics on Heritage or Quarries
Global stone trade figures we can safely reference *with attribution* (e.g.
"Turkey is the world's leading marble & travertine exporter — source:
[some verifiable trade body]") to give the Heritage/Quarries pages more
authority than founder-story alone currently provides. Needs: picking a
citable, current source (not just re-stating turkishstones.org's number
without attribution — their number is dated 2024 and unsourced on-page).

### 3. Deepen the Heritage page with macro historical/geological framing
Their About page opens with Göbeklitepe (oldest known human settlement,
in Anatolia) and situates Turkey on the Alpine-Himalayan geological belt —
a compelling "why this region, why this material" hook. DIJA's Heritage page
is currently all founder-story (Khadija, the family). Adding a short
"why Anatolia/the Mediterranean has been a stone source for 12,000 years"
section *alongside* the founder story (not replacing it) would give Heritage
both the personal and the historical/geological credibility layer.

---

## P1 — worth doing, moderate engineering effort

### 4. Map view for Quarries
Their Stones Index has a literal map-view toggle for browsing by geography.
DIJA's `/quarries` page ([app/(site)/quarries/page.tsx](app/(site)/quarries/page.tsx))
is currently text/table-based (country → geology → extraction method →
block sizes → ports). A visual map (e.g. Leaflet with pinned quarry regions)
would be a genuine differentiator and matches how buyers actually think about
sourcing geography. Real engineering lift: map library integration, needs
lat/lng per region added to `config/*.json` quarry data.

### 5. Tighten the Materials filter UX to their Type/Color/Keyword pattern
DIJA's `/materials` already filters by country/type/tone + free-text search —
structurally very close to their Type/Color/Keyword split already. Low-effort
polish: make the color/tone filter visually swatch-based (a row of color dots)
instead of a plain dropdown, closer to how their UI reads at a glance.

---

## P2 — good ideas, but blocked on data we don't have yet or lower priority

### 6. Real, architect-credited project case studies
Their `/inspire/projects/` page lists dozens of real, dated, architect-credited
projects (name, year, city, firm). This is exactly the gold-standard format
for what DIJA's own Projects section should look like — but this is already
tracked as **task #11** (purge/replace fictional projects) from the earlier
pre-launch audit, and is blocked on you supplying real project data, not on
me building anything new. Their site is a good reference for the *format*
(one-line architect + year + city credit under each project name) once real
projects exist.

### 7. Trust-logo strip ("Firm X used Turkish Stones for [landmark project]")
Their About page leads with a named case (KAAN Architecten / Supreme Court of
the Netherlands). DIJA could do the same once real, permissioned client/project
logos exist — ties to the same data gap as #6 and to task #12 (real invoice
entity/legal details), i.e. this needs real business facts, not more code.

### 8. Separate "News & Events" section from Journal
They split editorial "Journal"-style content from operational "News & Events"
(trade shows, competitions, industry news). DIJA currently only has Journal.
I'd only build this once there's an actual recurring stream of real news to
post (trade show attendance, awards, etc.) — building an empty News section
now would just be another hollow content area, the same mistake as the
"fictional projects" problem we're already fixing.

### 9. Video library / Talks / webinar content
Their Library has produced videos and recorded webinars. This is a real
production/resourcing commitment (filming, editing, hosting) that's
proportionate for a national association's budget, not obviously so for a
family atelier at pre-launch stage. I'd skip this unless you specifically
want to invest in video content — flagging it rather than silently building
an empty "Videos" tab.

---

## Explicitly not recommending

- Copying their page copy, structure, or stats verbatim — it's another
  organization's content and their numbers describe Turkey's industry, not
  DIJA.
- Matching their scale (80+ stone types is a national index; DIJA's ~150
  stones is already a strong, real catalog for a single company — no need to
  chase their breadth).

---

## Suggested order if you want me to start building

1. P0 items (#1–#3) — content-only, no new data needed, can start immediately.
2. P1 #5 (filter polish) — quick, self-contained.
3. P1 #4 (map view) — bigger lift, worth scoping separately once you confirm
   you want it.
4. P2 items — revisit once the underlying data gaps (tasks #11/#12) are
   resolved with your real business input.
