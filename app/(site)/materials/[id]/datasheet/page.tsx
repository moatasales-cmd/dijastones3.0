import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stoneImg } from "@/lib/img";
import PrintButton from "@/components/PrintButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await prisma.stone.findUnique({ where: { id }, select: { n: true } });
  return { title: s ? `${s.n} — Datasheet` : "Datasheet" };
}

export default async function DatasheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await prisma.stone.findUnique({ where: { id } });
  if (!s) notFound();

  const img = stoneImg(s);
  const specs: [string, string | null][] = [
    ["Sizes", s.sizes],
    ["Thicknesses", s.thicknesses],
    ["Finishes", s.finishes],
    ["Applications", s.applications],
    ["Water absorption", s.absorption],
    ["Density", s.density],
    ["Compressive strength", s.strength],
    ["Slip resistance", s.slip],
    ["Geological age", s.age],
  ];

  return (
    <section className="section" style={{ paddingTop: "6rem" }}>
      <div className="container narrow">
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <PrintButton label="Print / Save PDF" />
        </div>

        <div className="pf-invoice" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "2.5rem", background: "var(--card-bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ margin: 0 }}>DIJA</h1>
              <p style={{ opacity: 0.7, margin: 0 }}>Natural Stone Atelier · Izmir</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0 }}>Technical Datasheet</h2>
              <p style={{ margin: 0, opacity: 0.7 }}>{new Date().toISOString().slice(0, 10)}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: img ? "220px 1fr" : "1fr", gap: "2rem", marginBottom: "2rem" }}>
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={s.n} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 6 }} />
            )}
            <div>
              <h2 style={{ margin: "0 0 0.25rem" }}>{s.n}</h2>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {s.ty} · {s.c} · {s.ci}
              </p>
              {s.d && <p style={{ marginTop: "1rem" }}>{s.d}</p>}
              {s.p != null && (
                <p style={{ marginTop: "1rem", fontWeight: 600 }}>
                  From ${s.p.toFixed(2)}/m²
                  {s.pPremium && s.pPremium > s.p ? ` · Premium $${s.pPremium.toFixed(2)}/m²` : ""}
                </p>
              )}
            </div>
          </div>

          <table className="qry-block-table" style={{ width: "100%" }}>
            <tbody>
              {specs.map(([label, val]) => (
                <tr key={label}>
                  <td style={{ textAlign: "left", fontWeight: 600, width: "40%" }}>{label}</td>
                  <td style={{ textAlign: "left" }}>{val || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: "2rem", fontSize: "0.8rem", opacity: 0.6 }}>
            Specifications are indicative; natural stone varies by block and lot. Contact DIJA for
            certified test reports and current availability.
          </p>
        </div>
      </div>
    </section>
  );
}
