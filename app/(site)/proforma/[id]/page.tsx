import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = { title: "Proforma Invoice" };

const money = (v: number | null | undefined) =>
  "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Item {
  stoneName: string;
  thickness: string;
  finish: string;
  grade: string;
  area: number;
  unitPrice: number;
  lineTotal: number;
}
interface ClientSnap {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default async function ProformaView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pf = await prisma.proforma.findUnique({ where: { id } });
  if (!pf) notFound();

  // Owner-only view.
  const client = await getCurrentClient();
  if (!client || pf.clientId !== client.id) notFound();

  const items = (Array.isArray(pf.items) ? pf.items : []) as unknown as Item[];
  const c = (pf.client ?? {}) as ClientSnap;

  return (
    <section className="section" style={{ paddingTop: "6rem" }}>
      <div className="container narrow">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Link href="/account/proformas" className="pf-btn pf-btn-ghost">
            <i className="fa-solid fa-arrow-left" /> My proformas
          </Link>
          <PrintButton label="Print / Save PDF" />
        </div>

        <div className="pf-invoice" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "2.5rem", background: "var(--card-bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ margin: 0 }}>DIJA</h1>
              <p style={{ opacity: 0.7, margin: 0 }}>Natural Stone Atelier · Izmir</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0 }}>Proforma Invoice</h2>
              <p style={{ margin: 0 }}>{pf.id}</p>
              <p style={{ margin: 0, opacity: 0.7 }}>Date: {pf.createdAt?.slice(0, 10)}</p>
              <p style={{ margin: 0, opacity: 0.7 }}>Valid until: {pf.validUntil}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <div className="section-label">Bill to</div>
              <p style={{ margin: 0 }}>
                <strong>{c.name}</strong>
                {c.company ? <><br />{c.company}</> : null}
                {c.address ? <><br />{c.address}</> : null}
                {(c.city || c.country) ? <><br />{[c.city, c.country].filter(Boolean).join(", ")}</> : null}
                {c.email ? <><br />{c.email}</> : null}
                {c.phone ? <><br />{c.phone}</> : null}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="section-label">Terms</div>
              <p style={{ margin: 0 }}>
                Incoterm: <strong>{pf.incoterm}</strong>
                <br />
                Payment: {pf.paymentTerm}
                <br />
                Destination: {pf.destinationCountry}
                <br />
                Zone: {pf.shippingZone}
              </p>
            </div>
          </div>

          <table className="qry-block-table" style={{ width: "100%", marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Stone</th>
                <th>Thickness</th>
                <th>Finish</th>
                <th>Grade</th>
                <th>Area (m²)</th>
                <th>Unit</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "left" }}>{it.stoneName}</td>
                  <td>{it.thickness}</td>
                  <td>{it.finish}</td>
                  <td>{it.grade}</td>
                  <td>{it.area.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                  <td>{money(it.unitPrice)}</td>
                  <td style={{ textAlign: "right" }}>{money(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: "auto", maxWidth: 320 }}>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Goods subtotal</span><span>{money(pf.subtotal)}</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Containers (20ft)</span><span>{pf.totalContainers}</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Freight {pf.sellerFreight ? "(included)" : "(buyer)"}</span><span>{money(pf.shippingCost)}</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "1.15rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              <span>Grand total</span><span>{money(pf.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
