import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Stone } from "@/lib/generated/prisma/client";
import { stoneImg } from "@/lib/img";

export const metadata: Metadata = { title: "Compare Materials" };

const SPEC_ROWS: [string, keyof Stone][] = [
  ["Type", "ty"],
  ["Country", "c"],
  ["Region / quarry", "ci"],
  ["Colour", "cn"],
  ["Sizes", "sizes"],
  ["Thicknesses", "thicknesses"],
  ["Finishes", "finishes"],
  ["Applications", "applications"],
  ["Water absorption", "absorption"],
  ["Density", "density"],
  ["Compressive strength", "strength"],
  ["Slip resistance", "slip"],
  ["Geological age", "age"],
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const stones = ids.length
    ? await prisma.stone.findMany({ where: { id: { in: ids } } })
    : [];
  // Preserve the order the user added them in.
  const ordered = ids.map((id) => stones.find((s) => s.id === id)).filter(Boolean) as typeof stones;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">Compare</div>
          <h1 className="hero-title">Side-by-side comparison</h1>
          <p>Compare up to 3 stones on specs, pricing, and origin.</p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          {ordered.length === 0 ? (
            <p className="dash-empty">
              No stones selected. Browse the{" "}
              <Link href="/materials" className="auth-link">materials</Link> and tap the compare icon on any card.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="qry-block-table" style={{ width: "100%", minWidth: 480 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>&nbsp;</th>
                    {ordered.map((s) => (
                      <th key={s.id} style={{ minWidth: 200 }}>
                        <Link href={`/materials/${s.id}`} style={{ display: "block" }}>
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "4/3",
                              borderRadius: 6,
                              overflow: "hidden",
                              marginBottom: "0.5rem",
                              background: "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
                            }}
                          >
                            {stoneImg(s) && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={stoneImg(s)!} alt={s.n} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                          <strong>{s.n}</strong>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600 }}>Price /m²</td>
                    {ordered.map((s) => (
                      <td key={s.id}>{s.p != null ? `$${s.p.toFixed(2)}` : "—"}</td>
                    ))}
                  </tr>
                  {SPEC_ROWS.map(([label, key]) => (
                    <tr key={key}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>{label}</td>
                      {ordered.map((s) => (
                        <td key={s.id}>{(s[key] as string) || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
