/**
 * One-time migration / seed: reads the original DIJA JSON exports from
 * prisma/seed-data/*.json and loads them into the database, mapping the old
 * short/snake_case keys onto the Prisma schema. Idempotent — clears tables
 * first, so it can be re-run safely.
 *
 * Run with:  npx tsx prisma/seed.ts
 */
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const DATA_DIR = join(import.meta.dirname, "seed-data");

/** Read a seed JSON file, stripping a possible UTF-8 BOM (posts.json has one). */
function read<T = unknown>(name: string): T {
  const raw = readFileSync(join(DATA_DIR, `${name}.json`), "utf8").replace(
    /^﻿/,
    ""
  );
  return JSON.parse(raw) as T;
}

const orNull = <T>(v: T | undefined): T | null => (v === undefined ? null : v);
type Row = Record<string, any>;

async function main() {
  console.log("Clearing existing data…");
  // Order matters for the Favorite → Client foreign key.
  await prisma.favorite.deleteMany();
  await prisma.client.deleteMany();
  await prisma.stone.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.project.deleteMany();
  await prisma.post.deleteMany();
  await prisma.proforma.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.tradeApplication.deleteMany();
  await prisma.office.deleteMany();

  // ---- Stones (152) --------------------------------------------------------
  const stones = read<Row[]>("stones");
  for (const s of stones) {
    await prisma.stone.create({
      data: {
        id: s.id,
        n: s.n,
        c: s.c,
        r: orNull(s.r),
        ci: orNull(s.ci),
        ty: orNull(s.ty),
        to: orNull(s.to),
        cn: orNull(s.cn),
        d: orNull(s.d),
        no: orNull(s.no),
        p: orNull(s.p),
        pPremium: orNull(s.p_premium),
        sizes: orNull(s.sizes),
        thicknesses: orNull(s.thicknesses),
        finishes: orNull(s.finishes),
        applications: orNull(s.applications),
        absorption: orNull(s.absorption),
        density: orNull(s.density),
        strength: orNull(s.strength),
        slip: orNull(s.slip),
        age: orNull(s.age),
        g: s.g ?? undefined,
        col: s.col ?? undefined,
      },
    });
  }
  console.log(`Stones:      ${stones.length}`);

  // ---- Collections (seeded — were hard-coded in inc/init.php) --------------
  const collections = [
    { id: "quiet-whites", n: "Quiet Whites", d: "Curated for minimalist residential and hospitality projects." },
    { id: "deep-seas", n: "Deep Seas", d: "For accent walls and surfaces that feel like deep water." },
    { id: "warm-earths", n: "Warm Earths", d: "For terraces, floors, and surfaces touched by bare feet." },
    { id: "veined-drama", n: "Veined Drama", d: "For the single statement surface — island, fireplace, feature wall." },
    { id: "earth-fire", n: "Earth & Fire", d: "The warm-toned stones of the Mediterranean basin." },
    { id: "exotic-statement", n: "Exotic Statement", d: "When the brief calls for something nobody's seen before." },
  ];
  for (const c of collections) {
    await prisma.collection.create({
      data: { ...c, cov: `/assets/images/collections/${c.id}.png` },
    });
  }
  console.log(`Collections: ${collections.length}`);

  // ---- Projects (11, bilingual) -------------------------------------------
  const projects = read<Row[]>("projects");
  for (const p of projects) {
    await prisma.project.create({
      data: {
        id: p.id,
        t: p.t,
        tFr: orNull(p.t_fr),
        y: orNull(p.y),
        c: orNull(p.c),
        cFr: orNull(p.c_fr),
        a: orNull(p.a),
        l: orNull(p.l),
        st: orNull(p.st),
        to: orNull(p.to),
        p: orNull(p.p),
        d: orNull(p.d),
        b: orNull(p.b),
        bFr: orNull(p.b_fr),
        bo: orNull(p.bo),
        boFr: orNull(p.bo_fr),
        q: orNull(p.q),
        qFr: orNull(p.q_fr),
        qb: orNull(p.qb),
        qbFr: orNull(p.qb_fr),
        g: p.g ?? undefined,
      },
    });
  }
  console.log(`Projects:    ${projects.length}`);

  // ---- Posts (10, bilingual) ----------------------------------------------
  const posts = read<Row[]>("posts");
  for (const a of posts) {
    await prisma.post.create({
      data: {
        id: a.id,
        t: a.t,
        tFr: orNull(a.t_fr),
        c: orNull(a.c),
        cFr: orNull(a.c_fr),
        a: orNull(a.a),
        dt: orNull(a.dt),
        r: orNull(a.r),
        e: orNull(a.e),
        eFr: orNull(a.e_fr),
        img: orNull(a.img),
        b: orNull(a.b),
        bFr: orNull(a.b_fr),
      },
    });
  }
  console.log(`Posts:       ${posts.length}`);

  // ---- Clients (9) + Favorites --------------------------------------------
  const clients = read<Row[]>("clients");
  for (const c of clients) {
    await prisma.client.create({
      data: {
        id: c.id,
        email: c.email,
        name: orNull(c.name),
        passwordHash: orNull(c.password_hash),
        createdAt: orNull(c.created_at),
        lastLogin: orNull(c.last_login),
        lastActivity: orNull(c.last_activity),
        verified: !!c.verified,
        googleId: orNull(c.google_id),
        activityLog: c.activity_log ?? undefined,
        fullName: orNull(c.full_name),
        phone: orNull(c.phone),
        jobTitle: orNull(c.job_title),
        companyName: orNull(c.company_name),
        companyType: orNull(c.company_type),
        country: orNull(c.country),
        city: orNull(c.city),
        address: orNull(c.address),
        vatId: orNull(c.vat_id),
        website: orNull(c.website),
        preferredPort: orNull(c.preferred_port),
        about: orNull(c.about),
      },
    });
  }
  console.log(`Clients:     ${clients.length}`);

  const favMap = read<Record<string, string[]>>("favorites");
  const clientIds = new Set(clients.map((c) => c.id));
  let favCount = 0;
  for (const [clientId, stoneIds] of Object.entries(favMap)) {
    if (!clientIds.has(clientId)) continue; // skip orphaned favorites
    for (const stoneId of stoneIds) {
      await prisma.favorite.create({ data: { clientId, stoneId } });
      favCount++;
    }
  }
  console.log(`Favorites:   ${favCount}`);

  // ---- Proformas (9) -------------------------------------------------------
  const proformas = read<Row[]>("proformas");
  for (const p of proformas) {
    await prisma.proforma.create({
      data: {
        id: p.id,
        createdAt: orNull(p.created_at),
        validUntil: orNull(p.valid_until),
        unitSystem: orNull(p.unit_system),
        clientId: orNull(p.client_id),
        client: p.client ?? undefined,
        destinationCountry: orNull(p.destination_country),
        destinationPort: orNull(p.destination_port),
        incoterm: orNull(p.incoterm),
        incotermLabel: orNull(p.incoterm_label),
        paymentTerm: orNull(p.payment_term),
        shippingZone: orNull(p.shipping_zone),
        shippingRatePerContainer: orNull(p.shipping_rate_per_container),
        totalContainers: orNull(p.total_containers),
        containerDetail: p.container_detail ?? undefined,
        perOriginShipping: p.per_origin_shipping ?? undefined,
        shippingNote: orNull(p.shipping_note),
        shippingDisclaimer: orNull(p.shipping_disclaimer),
        totalM2: orNull(p.total_m2),
        subtotal: orNull(p.subtotal),
        shippingCost: orNull(p.shipping_cost),
        sellerFreight: orNull(p.seller_freight),
        costBreakdown: p.cost_breakdown ?? undefined,
        totalAdditional: orNull(p.total_additional),
        grandTotal: orNull(p.grand_total),
        totalSqf: orNull(p.total_sqf),
        items: p.items ?? undefined,
        notes: orNull(p.notes),
        status: orNull(p.status),
      },
    });
  }
  console.log(`Proformas:   ${proformas.length}`);

  // ---- Leads: contacts, quote requests, trade applications ----------------
  const contacts = read<Row[]>("contacts");
  for (const c of contacts) {
    await prisma.contact.create({
      data: {
        id: c.id,
        received: orNull(c.received),
        name: orNull(c.name),
        email: orNull(c.email),
        phone: orNull(c.phone),
        company: orNull(c.company),
        office: orNull(c.office),
        message: orNull(c.message),
      },
    });
  }
  console.log(`Contacts:    ${contacts.length}`);

  const quotes = read<Row[]>("quote-requests");
  for (const q of quotes) {
    await prisma.quoteRequest.create({
      data: {
        id: q.id,
        received: orNull(q.received),
        name: orNull(q.name),
        email: orNull(q.email),
        phone: orNull(q.phone),
        phoneCountry: orNull(q.phone_country),
        stoneId: orNull(q.stone_id),
        stoneName: orNull(q.stone_name),
        area: q.area != null ? String(q.area) : null,
        areaUnit: orNull(q.area_unit),
        message: orNull(q.message),
      },
    });
  }
  console.log(`Quotes:      ${quotes.length}`);

  const trade = read<Row[]>("trade-applications");
  for (const t of trade) {
    await prisma.tradeApplication.create({
      data: {
        id: t.id,
        received: orNull(t.received),
        name: orNull(t.name),
        email: orNull(t.email),
        phone: orNull(t.phone),
        company: orNull(t.company),
        role: orNull(t.role),
        referral: orNull(t.referral),
        values: t.values ?? undefined,
        projectExample: orNull(t.project_example),
        volume: orNull(t.volume),
        stoneInterest: orNull(t.stone_interest),
        notes: orNull(t.notes),
      },
    });
  }
  console.log(`Trade apps:  ${trade.length}`);

  // ---- Offices (10) --------------------------------------------------------
  const offices = read<Row[]>("offices");
  for (const o of offices) {
    await prisma.office.create({
      data: {
        id: o.id,
        type: orNull(o.type),
        role: orNull(o.role),
        city: orNull(o.city),
        country: orNull(o.country),
        flag: orNull(o.flag),
        partnerCompany: orNull(o.partner_company),
        contactPerson: orNull(o.contact_person),
        address: orNull(o.address),
        address2: orNull(o.address2),
        phone: o.phone ?? undefined,
        email: orNull(o.email),
        services: o.services ?? undefined,
        hours: orNull(o.hours),
        lat: orNull(o.lat),
        lng: orNull(o.lng),
        image: orNull(o.image),
        whatsapp: orNull(o.whatsapp),
      },
    });
  }
  console.log(`Offices:     ${offices.length}`);

  console.log("\n✅ Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
