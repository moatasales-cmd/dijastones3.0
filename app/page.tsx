import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stoneImg } from "@/lib/img";

// Signature materials shown on the home page, in this order.
const FEATURED_IDS = [
  "calacatta-oro",
  "black-aziza",
  "blue-bahia-granite",
  "taj-mahal-quartzite",
];

export default async function Home() {
  // Data now comes from the database (migrated from the old JSON files).
  const featuredRows = await prisma.stone.findMany({
    where: { id: { in: FEATURED_IDS } },
    select: { id: true, n: true, ci: true, c: true, g: true },
  });
  // Preserve the intended display order (findMany `in` doesn't guarantee it).
  const featured = FEATURED_IDS.map(
    (id) => featuredRows.find((s) => s.id === id)!
  ).filter(Boolean);

  const posts = await prisma.post.findMany({
    take: 2,
    select: { id: true, t: true, c: true, r: true, e: true, img: true },
  });

  return (
    <>
      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: "url(/assets/images/hero-bg.webp)" }}
        />
        <div className="hero-overlay" />
        <div className="hero-iridescent" />
        <div className="hero-noise" />
        <div className="hero-content">
          <h1>
            A quarry is just
            <br />
            <em>the earth&apos;s library,</em>
          </h1>
          <p className="hero-sub">and we know exactly which shelf to browse.</p>
          <div className="hero-btns">
            <Link href="/materials" className="btn btn-ghost">
              Explore Materials{" "}
              <span className="btn-icon-wrap">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </Link>
            <a href="/api/catalogue" target="_blank" className="btn btn-ghost">
              Download the Catalogue{" "}
              <span className="btn-icon-wrap">
                <i className="fa-solid fa-arrow-down" />
              </span>
            </a>
          </div>
          <div className="scroll-indicator">
            <span />
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container narrow">
          <div className="section-label">Why DIJA</div>
          <h2>
            A house built on
            <br />
            <em>geology</em> and patience.
          </h2>
          <div className="text-large">
            We source directly from family-owned quarries across Turkey, the
            Mediterranean, Brazil, and India — no middlemen, no shortcuts. Just
            traceable stone, fairly priced, personally vetted.
          </div>
          <p>
            From a single slab for a private residence to multi-container orders
            for hotel developments — we deliver 152 natural stones to 47
            countries, with the same standard: the right stone, accurately
            described, delivered on time.
          </p>
          <Link
            href="/materials"
            className="btn btn-primary"
            style={{ marginBottom: "2rem" }}
          >
            Explore Our Materials{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
          <div className="stats">
            <div className="stat">
              <span className="stat-num">152</span>
              <span className="stat-label">Stones</span>
            </div>
            <div className="stat">
              <span className="stat-num">10</span>
              <span className="stat-label">Sourcing Countries</span>
            </div>
            <div className="stat">
              <span className="stat-num">47</span>
              <span className="stat-label">Countries Shipped</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark bg-noise reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">Signature Materials</div>
              <h2>
                Stones with
                <br />
                <em>a sense of place.</em>
              </h2>
            </div>
            <Link href="/materials" className="link-arrow">
              All Materials <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <div className="grid-4 reveal-stagger">
            {featured.map((s) => (
              <Link
                key={s.id}
                href={`/materials/${s.id}`}
                className="card-swatch"
              >
                <div className="card-img">
                  {stoneImg(s) ? (
                    <img src={stoneImg(s)!} alt={s.n} loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
                      }}
                    />
                  )}
                  <span className="card-country">{s.c}</span>
                </div>
                <div className="card-body">
                  <h3>{s.n}</h3>
                  <span className="card-origin">
                    {s.ci}, {s.c}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow reveal">
          <div className="section-label">Featured Project · 2024</div>
          <h2>
            The Cala Luna
            <br />
            <em>Pavilion</em>
          </h2>
          <p className="text-large">
            A monolithic retreat on the Sardinian coast, sheathed entirely in
            honed Thassos White. 84 tons of stone, every panel book-matched by
            hand.
          </p>
          <div className="stats border-top">
            <div className="stat">
              <span className="stat-num">84 t</span>
              <span className="stat-label">Tonnage</span>
            </div>
            <div className="stat">
              <span className="stat-num">312</span>
              <span className="stat-label">Panels</span>
            </div>
            <div className="stat">
              <span className="stat-num">25 wk</span>
              <span className="stat-label">Duration</span>
            </div>
          </div>
          <Link href="/projects/cala-luna" className="btn btn-primary">
            Read Case Study{" "}
            <span className="btn-icon-wrap">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </section>

      <section className="section section-mist reveal">
        <div className="container">
          <div className="section-label text-center">
            From Mountain to Surface
          </div>
          <h2 className="text-center">
            Four movements of
            <br />
            <em>the craft.</em>
          </h2>
          <div className="process-grid reveal-stagger">
            <div className="process-card">
              <div className="process-num">01</div>
              <h3>Source</h3>
              <p>
                We partner with family-owned quarries across the Mediterranean,
                Brazil, and India, selecting blocks that meet our standards for
                tone, figure, and integrity.
              </p>
            </div>
            <div className="process-card">
              <div className="process-num">02</div>
              <h3>Cut</h3>
              <p>
                Gang saws slice blocks into slabs along the vein&apos;s preferred
                axis. Master cutters study each face before committing the blade.
              </p>
            </div>
            <div className="process-card">
              <div className="process-num">03</div>
              <h3>Finish</h3>
              <p>
                Honed, polished, leathered, brushed, bush-hammered — the finish
                decides how stone meets light.
              </p>
            </div>
            <div className="process-card">
              <div className="process-num">04</div>
              <h3>Ship</h3>
              <p>
                Custom crates, climate-controlled containers, and a logistics
                team that has delivered to 47 countries without a single broken
                slab.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section quote-section bg-noise reveal">
        <div className="container narrow text-center text-white">
          <i className="fa-solid fa-quote-left quote-icon" />
          <p className="quote-text">
            &quot;DIJA doesn&apos;t sell stone. They sell the silence of a mountain
            that has been listening to the sea for two thousand years.&quot;
          </p>
          <div className="quote-attrib">
            <span />
            <span>Studio Mareterra · Architects · Cagliari</span>
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">From the Journal</div>
              <h2>
                Field notes &amp;
                <br />
                <em>slow geology.</em>
              </h2>
            </div>
            <Link href="/journal" className="link-arrow">
              All Entries <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <div className="grid-3 reveal-stagger">
            {posts.map((a) => (
              <Link
                key={a.id}
                href={`/journal/${a.id}`}
                className="card-article"
              >
                <div className="card-img">
                  {a.img ? (
                    <img src={a.img} alt="" loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
                      }}
                    />
                  )}
                </div>
                <div className="card-meta">
                  {a.c} · {a.r}
                </div>
                <h3>{a.t}</h3>
                <p>{a.e}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
