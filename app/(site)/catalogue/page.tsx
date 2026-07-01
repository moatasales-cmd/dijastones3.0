import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = { title: "Full Catalogue" };

export default async function CataloguePage() {
  const stones = await prisma.stone.findMany({ orderBy: [{ ty: "asc" }, { n: "asc" }] });
  const types = [...new Set(stones.map((s) => s.ty).filter(Boolean))] as string[];
  const countries = new Set(stones.map((s) => s.c));

  return (
    <section className="section" style={{ paddingTop: "6rem" }}>
      <div className="container">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <div className="hero-label">DIJA Natural Stone</div>
            <h1 className="hero-title" style={{ fontSize: "2rem" }}>Full Catalogue</h1>
            <p>
              {stones.length} stones · {types.length} types · {countries.size} countries
            </p>
          </div>
          <PrintButton label="Print / Save PDF" />
        </div>

        {types.map((type) => (
          <div key={type} style={{ marginBottom: "2.5rem", pageBreakInside: "avoid" }}>
            <h2 style={{ borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>{type}</h2>
            <table className="qry-block-table" style={{ width: "100%", marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Origin</th>
                  <th style={{ textAlign: "left" }}>Colour</th>
                  <th>Price /m²</th>
                </tr>
              </thead>
              <tbody>
                {stones
                  .filter((s) => s.ty === type)
                  .map((s) => (
                    <tr key={s.id}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>{s.n}</td>
                      <td style={{ textAlign: "left" }}>
                        {s.ci ? `${s.ci}, ` : ""}
                        {s.c}
                      </td>
                      <td style={{ textAlign: "left" }}>{s.cn || "—"}</td>
                      <td>{s.p != null ? `$${s.p.toFixed(2)}` : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}

        <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          Prices are ex-works Izmir, indicative and subject to change. Contact DIJA for a formal
          proforma. Images available for each material at dijastones.com.
        </p>
      </div>
    </section>
  );
}
