import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import PrintButton from "@/components/PrintButton";
import SendProformaEmailButton from "@/components/SendProformaEmailButton";
import { buildInvoiceView, money } from "@/lib/proforma-view";
import bank from "@/config/bank.json";

export const metadata: Metadata = { title: "Proforma Invoice" };

const TNC = [
  "This proforma is valid for 14 days from the issue date.",
  "Prices are in USD. Base prices are for 2 cm thickness, Large Slab category, Polished finish. Size, thickness, and finish multipliers apply as per selected options.",
  "Container count is calculated based on 20ft container capacity: 450 m² (2 cm), 300 m² (3 cm), 600 m² (1 cm). Final count may vary.",
  "Natural stone is a product of nature. Color, veining, and texture variations are inherent characteristics and do not constitute defects.",
  "Final dimensions and quantities are subject to ±5% tolerance per industry standards.",
  "Packing: Standard seaworthy wooden crates suitable for container shipping (included in price).",
  "Insurance: Marine insurance is recommended for all shipments and can be arranged at 0.5% of the total invoice value.",
  "Claims for damage or shortage must be reported within 7 days of receipt.",
];

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

  const v = buildInvoiceView(pf);
  const sysLabel = v.unitSystem === "sqf" ? "ft²" : "m²";

  return (
    <section className="section" style={{ paddingTop: "6rem" }}>
      <div className="container narrow">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Link href="/account/proformas" className="pf-btn pf-btn-ghost">
            <i className="fa-solid fa-arrow-left" /> My proformas
          </Link>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {pf.status === "draft" && (
              <Link href={`/proforma/${pf.id}/edit`} className="pf-btn pf-btn-ghost">
                <i className="fa-solid fa-pen" /> Edit
              </Link>
            )}
            <SendProformaEmailButton proformaId={pf.id} toEmail={v.client.email || client.email} />
            <PrintButton label="Print / Save PDF" />
          </div>
        </div>

        <div className="pf-invoice" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "2.5rem", background: "var(--card-bg)" }}>
          {/* Header: logo + doc title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "2px solid var(--accent)", paddingBottom: "1.25rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo-dark.png" alt="DIJA Marble" style={{ height: 44, width: "auto" }} className="logo-light-mode" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo-light.png" alt="DIJA Marble" style={{ height: 44, width: "auto" }} className="logo-dark-mode" />
            <div style={{ textAlign: "right" }}>
              <h1 style={{ margin: 0 }}>Proforma Invoice</h1>
              <p style={{ margin: 0, opacity: 0.7 }}>{v.id}</p>
              <p style={{ margin: 0, opacity: 0.7 }}>Issued: {v.createdAt.slice(0, 10)}</p>
              <p style={{ margin: 0, opacity: 0.7 }}>Valid until: {v.validUntil}</p>
              <p style={{ margin: 0, opacity: 0.7 }}>Units: {v.unitSystem.toUpperCase()}</p>
            </div>
          </div>

          {/* Seller / buyer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div className="section-label">Seller</div>
              <p style={{ margin: 0 }}>
                <strong>DIJA Natural Stone</strong>
                <br />10031 Sok. No: 14, AOSB
                <br />Çiğli 35620 - İzmir - Türkiye
                <br />Phone: +90 232 556 12 00
                <br />Email: info@dijastones.com
              </p>
            </div>
            <div>
              <div className="section-label">Buyer</div>
              <p style={{ margin: 0 }}>
                <strong>{v.client.name || "—"}</strong>
                {v.client.company ? <><br />{v.client.company}</> : null}
                {v.client.address ? <><br />{v.client.address}</> : null}
                {(v.client.city || v.client.country) ? <><br />{[v.client.city, v.client.country].filter(Boolean).join(", ")}</> : null}
                {v.client.email ? <><br />Email: {v.client.email}</> : null}
                {v.client.phone ? <><br />Phone: {v.client.phone}</> : null}
              </p>
            </div>
          </div>

          {/* Incoterm / destination */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div className="section-label">Incoterm</div>
              <p style={{ margin: 0 }}>
                <strong>{v.incoterm}</strong>{v.incotermLabel ? ` — ${v.incotermLabel}` : ""}
              </p>
              {v.incotermDescription && <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: 0 }}>{v.incotermDescription}</p>}
            </div>
            <div>
              <div className="section-label">Destination</div>
              <p style={{ margin: 0 }}>{v.destinationPort ? `${v.destinationPort}, ` : ""}{v.destinationCountry || "—"}</p>
              <div className="section-label" style={{ marginTop: "0.5rem" }}>Shipping zone</div>
              <p style={{ margin: 0 }}>{v.shippingZone || "—"}</p>
            </div>
          </div>

          {/* Containers */}
          {v.containers.length > 0 && (
            <>
              <h3 style={{ marginBottom: "0.5rem" }}>Container Requirements</h3>
              <div style={{ background: "var(--bg-mist)", borderLeft: "3px solid var(--accent)", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Total containers required: {v.totalContainers} × 20ft</p>
                {v.containers.map((c, i) => (
                  <p key={i} style={{ margin: "0.25rem 0 0", opacity: 0.8 }}>
                    {c.thickness}: {c.areaM2.toFixed(2)} m² — capacity {c.capacityM2} m²/container — {c.containers} container(s)
                  </p>
                ))}
              </div>
            </>
          )}

          {/* Items */}
          <h3 style={{ marginBottom: "0.5rem" }}>Items</h3>
          <table className="qry-block-table" style={{ width: "100%", marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Photo</th>
                <th style={{ textAlign: "left" }}>Stone</th>
                <th>Finish</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Total area</th>
                <th>Thk</th>
                <th>Unit price</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {v.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    {it.stoneImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.stoneImage} alt={it.stoneName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 4, background: "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))" }} />
                    )}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <strong>{it.stoneName}</strong>
                    <br /><span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{it.stoneOrigin} · {it.stoneType}</span>
                    <br /><span className="badge" style={{ display: "inline-block", padding: "1px 6px", background: "var(--accent)", color: "#fff", fontSize: "0.65rem", borderRadius: 2, marginTop: 2 }}>{it.grade}</span>
                  </td>
                  <td>{it.finish}</td>
                  <td>{it.categoryName}<br /><span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{it.sizeLabel}</span></td>
                  <td>{it.pieces ? `${it.pieces} pc` : "—"}</td>
                  <td>{it.totalArea.toLocaleString("en-US", { maximumFractionDigits: 2 })} {sysLabel}</td>
                  <td>{it.thickness}</td>
                  <td>{money(it.unitPrice)}/{sysLabel}</td>
                  <td style={{ textAlign: "right" }}>{money(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cost breakdown */}
          {v.costBreakdown.some((c) => c.included && c.amount > 0) && (
            <div style={{ marginLeft: "auto", maxWidth: 380, marginBottom: "0.5rem" }}>
              <p style={{ fontWeight: 600, color: "var(--accent)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Cost breakdown ({v.incotermLabel || v.incoterm})
              </p>
              {v.costBreakdown.filter((c) => c.included && c.amount > 0).map((c) => (
                <div key={c.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "0.15rem 0" }}>
                  <span>{c.label}</span><span>{money(c.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div style={{ marginLeft: "auto", maxWidth: 380 }}>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total area</span><span>{v.totalM2.toLocaleString("en-US", { maximumFractionDigits: 2 })} m²</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Containers</span><span>{v.totalContainers} × 20ft</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Goods subtotal</span><span>{money(v.subtotal)}</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Estimated freight</span><span>{money(v.shippingCost)}</span>
            </div>
            <div className="pf-summary-row" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "1.15rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              <span>Grand total</span><span>{money(v.grandTotal)}</span>
            </div>
          </div>

          <p style={{ fontSize: "0.8rem", opacity: 0.6, fontStyle: "italic", marginTop: "1rem" }}>* Transportation costs are estimated and may vary by destination and market rates at the time of shipment.</p>
          {v.shippingDisclaimer && (
            <p style={{ fontSize: "0.8rem", color: "var(--accent)", fontStyle: "italic", marginTop: "0.5rem" }}>
              <strong>Important:</strong> {v.shippingDisclaimer}
            </p>
          )}

          {/* Payment terms */}
          <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>Payment Terms</h3>
          <div style={{ background: "var(--bg-mist)", borderLeft: "3px solid var(--accent)", padding: "1rem", fontSize: "0.85rem" }}>
            {v.paymentTermName && <p style={{ fontWeight: 600, margin: 0 }}>{v.paymentTermName}</p>}
            {v.paymentTermDescription && <p style={{ margin: "0.35rem 0" }}>{v.paymentTermDescription}</p>}
            {v.paymentTermRequirements && <p style={{ opacity: 0.7, margin: 0 }}>Requirements: {v.paymentTermRequirements}</p>}
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.75rem 0" }} />
            <p style={{ fontWeight: 600, margin: 0 }}>Advance payment (30%): {money(v.advancePayment)}</p>
            <p style={{ fontWeight: 600, margin: "0.25rem 0 0" }}>Balance before shipment (70%): {money(v.balancePayment)}</p>
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.75rem 0" }} />
            <p style={{ fontWeight: 600, margin: 0 }}>
              Payment methods accepted: Bank Wire Transfer (T/T), Confirmed Irrevocable L/C at Sight, Cash Against Documents (subject to approval)
            </p>
          </div>

          {/* Bank details */}
          <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>Bank Details</h3>
          <div style={{ background: "var(--bg-mist)", borderLeft: "3px solid var(--accent)", padding: "1rem", fontSize: "0.85rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600, width: 130 }}>Bank:</td><td>{bank.bank_name}</td></tr>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600 }}>Address:</td><td>{bank.bank_address}</td></tr>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600 }}>Account:</td><td>{bank.account_number}</td></tr>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600 }}>SWIFT/BIC:</td><td>{bank.swift_bic}</td></tr>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600 }}>IBAN:</td><td style={{ fontFamily: "monospace", fontWeight: 600 }}>{bank.iban}</td></tr>
                <tr><td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600 }}>Beneficiary:</td><td>{bank.company_name}</td></tr>
              </tbody>
            </table>
          </div>

          {/* T&Cs */}
          <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>Terms &amp; Conditions</h3>
          <div style={{ fontSize: "0.78rem", opacity: 0.75, lineHeight: 1.7 }}>
            {TNC.map((t, i) => (
              <p key={i} style={{ margin: "0.2rem 0" }}>{i + 1}. {t}</p>
            ))}
          </div>

          {v.notes && (
            <>
              <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>Client Notes</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, whiteSpace: "pre-wrap" }}>{v.notes}</p>
            </>
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", fontSize: "0.75rem", opacity: 0.6 }}>
            <div>
              <strong>DIJA Natural Stone</strong><br />10031 Sok. No: 14, AOSB<br />Çiğli 35620 - İzmir - Türkiye
            </div>
            <div style={{ textAlign: "right" }}>
              Tax ID: 123-456-7890<br />info@dijastones.com — www.dijastones.com<br />+90 232 556 12 00
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.7rem", opacity: 0.4, marginTop: "0.5rem" }}>
            This is a computer-generated document. No signature is required. — {v.id}
          </p>
        </div>
      </div>
    </section>
  );
}
