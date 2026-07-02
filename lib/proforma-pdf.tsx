import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { InvoiceView } from "@/lib/proforma-view";
import { money } from "@/lib/proforma-view";
import bank from "@/config/bank.json";

// Resolve a "/assets/..." DB path to an actual file on disk (public/), for
// react-pdf's Image component (which accepts local file paths server-side).
// Falls back to undefined if the file doesn't exist, so a missing photo
// never crashes PDF generation.
function publicPath(p: string): string | undefined {
  if (!p) return undefined;
  const clean = p.replace(/^\/+/, "");
  const full = path.join(process.cwd(), "public", clean);
  return existsSync(full) ? full : undefined;
}

const s = StyleSheet.create({
  page: { padding: 52, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#915D36" },
  logo: { height: 38, width: 120, objectFit: "contain" },
  docTitle: { fontSize: 17, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#6b6560", marginTop: 2 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#915D36", marginTop: 18, marginBottom: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "#e0d8d0" },
  infoGrid: { flexDirection: "row", gap: 24, marginBottom: 14 },
  infoBlock: { flex: 1 },
  label: { fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: "#915D36", fontFamily: "Helvetica-Bold", marginBottom: 4 },
  p: { fontSize: 10, lineHeight: 1.7 },
  small: { fontSize: 8.5, color: "#6b6560", lineHeight: 1.5 },
  table: { width: "100%", marginBottom: 16 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e0d8d0", alignItems: "center", paddingVertical: 8 },
  th: { fontSize: 7.5, letterSpacing: 0.5, textTransform: "uppercase", color: "#915D36", fontFamily: "Helvetica-Bold" },
  photoCol: { width: 36 },
  stoneCol: { flex: 2.2 },
  colSm: { flex: 0.9, textAlign: "center" },
  colNum: { flex: 1, textAlign: "right" },
  photo: { width: 32, height: 32, objectFit: "cover", borderRadius: 3 },
  totalsWrap: { alignSelf: "flex-end", width: 280, marginTop: 6 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsGrand: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 8, borderTopWidth: 2, borderTopColor: "#1a1a1a", fontFamily: "Helvetica-Bold", fontSize: 12 },
  box: { backgroundColor: "#f8f6f3", borderLeftWidth: 3, borderLeftColor: "#915D36", padding: 14, marginBottom: 14 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e0d8d0", fontSize: 8.5, color: "#6b6560" },
  tncLine: { fontSize: 8, color: "#6b6560", marginBottom: 4, lineHeight: 1.6 },
});

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

function ProformaDocument({ v }: { v: InvoiceView }) {
  const logoPath = publicPath("/assets/images/logo-dark.png");
  const includedCosts = v.costBreakdown.filter((c) => c.included && c.amount > 0);
  const sysLabel = v.unitSystem === "sqf" ? "ft²" : "m²";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {logoPath ? <Image src={logoPath} style={s.logo} /> : <Text style={s.docTitle}>DIJA</Text>}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.docTitle}>Proforma Invoice</Text>
            <Text style={s.meta}>{v.id}</Text>
            <Text style={s.meta}>Issued: {v.createdAt.slice(0, 10)}</Text>
            <Text style={s.meta}>Valid until: {v.validUntil}</Text>
            <Text style={s.meta}>Units: {v.unitSystem.toUpperCase()}</Text>
          </View>
        </View>

        <View style={s.infoGrid}>
          <View style={s.infoBlock}>
            <Text style={s.label}>Seller</Text>
            <Text style={s.p}>DIJA Natural Stone</Text>
            <Text style={s.p}>10031 Sok. No: 14, AOSB</Text>
            <Text style={s.p}>Çiğli 35620 - İzmir - Türkiye</Text>
            <Text style={s.p}>Phone: +90 232 556 12 00</Text>
            <Text style={s.p}>Email: info@dijastones.com</Text>
          </View>
          <View style={s.infoBlock}>
            <Text style={s.label}>Buyer</Text>
            <Text style={s.p}>{v.client.name || "—"}</Text>
            {v.client.company ? <Text style={s.p}>{v.client.company}</Text> : null}
            {v.client.address ? <Text style={s.p}>{v.client.address}</Text> : null}
            {v.client.city || v.client.country ? (
              <Text style={s.p}>{[v.client.city, v.client.country].filter(Boolean).join(", ")}</Text>
            ) : null}
            {v.client.email ? <Text style={s.p}>Email: {v.client.email}</Text> : null}
            {v.client.phone ? <Text style={s.p}>Phone: {v.client.phone}</Text> : null}
          </View>
        </View>

        <View style={s.infoGrid}>
          <View style={s.infoBlock}>
            <Text style={s.label}>Incoterm</Text>
            <Text style={s.p}>{v.incoterm} — {v.incotermLabel}</Text>
            {v.incotermDescription ? <Text style={s.small}>{v.incotermDescription}</Text> : null}
          </View>
          <View style={s.infoBlock}>
            <Text style={s.label}>Destination</Text>
            <Text style={s.p}>{v.destinationPort ? `${v.destinationPort}, ` : ""}{v.destinationCountry || "—"}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>Shipping zone</Text>
            <Text style={s.p}>{v.shippingZone || "—"}</Text>
          </View>
        </View>

        {v.containers.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Container Requirements</Text>
            <View style={s.box}>
              <Text style={[s.p, { fontFamily: "Helvetica-Bold" }]}>
                Total containers required: {v.totalContainers} × 20ft
              </Text>
              {v.containers.map((c, i) => (
                <Text key={i} style={s.small}>
                  {c.thickness}: {c.areaM2.toFixed(2)} m² — capacity {c.capacityM2} m²/container — {c.containers} container(s)
                </Text>
              ))}
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>Items</Text>
        <View style={s.table}>
          <View style={s.tr}>
            <Text style={[s.th, s.photoCol]}> </Text>
            <Text style={[s.th, s.stoneCol]}>Stone</Text>
            <Text style={[s.th, s.colSm]}>Finish</Text>
            <Text style={[s.th, s.colSm]}>Size</Text>
            <Text style={[s.th, s.colSm]}>Area</Text>
            <Text style={[s.th, s.colSm]}>Thk</Text>
            <Text style={[s.th, s.colNum]}>Unit</Text>
            <Text style={[s.th, s.colNum]}>Total</Text>
          </View>
          {v.items.map((it, i) => {
            const imgPath = publicPath(it.stoneImage);
            return (
              <View style={s.tr} key={i} wrap={false}>
                <View style={s.photoCol}>
                  {imgPath ? <Image src={imgPath} style={s.photo} /> : null}
                </View>
                <View style={s.stoneCol}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{it.stoneName}</Text>
                  <Text style={s.small}>{it.stoneOrigin} · {it.stoneType} · {it.grade}</Text>
                </View>
                <Text style={s.colSm}>{it.finish}</Text>
                <Text style={s.colSm}>{it.sizeLabel}</Text>
                <Text style={s.colSm}>{it.totalArea.toFixed(2)} {sysLabel}</Text>
                <Text style={s.colSm}>{it.thickness}</Text>
                <Text style={s.colNum}>{money(it.unitPrice)}</Text>
                <Text style={s.colNum}>{money(it.lineTotal)}</Text>
              </View>
            );
          })}
        </View>

        {includedCosts.length > 0 && (
          <View style={[s.totalsWrap, { marginBottom: 2 }]}>
            <Text style={[s.label, { marginBottom: 2 }]}>Cost breakdown ({v.incotermLabel || v.incoterm})</Text>
            {includedCosts.map((c) => (
              <View style={s.totalsRow} key={c.code}>
                <Text style={s.small}>{c.label}</Text>
                <Text style={s.small}>{money(c.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.totalsWrap}>
          <View style={s.totalsRow}><Text>Total area</Text><Text>{v.totalM2.toFixed(2)} m²</Text></View>
          <View style={s.totalsRow}><Text>Containers</Text><Text>{v.totalContainers} × 20ft</Text></View>
          <View style={s.totalsRow}><Text>Goods subtotal</Text><Text>{money(v.subtotal)}</Text></View>
          <View style={s.totalsRow}><Text>Estimated freight</Text><Text>{money(v.shippingCost)}</Text></View>
          <View style={s.totalsGrand}><Text>Grand total</Text><Text>{money(v.grandTotal)}</Text></View>
        </View>

        <Text style={[s.small, { marginTop: 8, fontStyle: "italic" }]}>
          * Transportation costs are estimated and may vary by destination and market rates at the time of shipment.
        </Text>
        {v.shippingDisclaimer ? (
          <Text style={[s.small, { color: "#915D36", fontStyle: "italic", marginTop: 4 }]}>
            Important: {v.shippingDisclaimer}
          </Text>
        ) : null}

        <Text style={s.sectionTitle}>Payment Terms</Text>
        <View style={s.box}>
          {v.paymentTermName ? <Text style={[s.p, { fontFamily: "Helvetica-Bold" }]}>{v.paymentTermName}</Text> : null}
          {v.paymentTermDescription ? <Text style={s.p}>{v.paymentTermDescription}</Text> : null}
          {v.paymentTermRequirements ? <Text style={s.small}>Requirements: {v.paymentTermRequirements}</Text> : null}
          <Text style={[s.p, { fontFamily: "Helvetica-Bold", marginTop: 6 }]}>
            Advance payment (30%): {money(v.advancePayment)}
          </Text>
          <Text style={[s.p, { fontFamily: "Helvetica-Bold" }]}>
            Balance before shipment (70%): {money(v.balancePayment)}
          </Text>
          <Text style={[s.p, { fontFamily: "Helvetica-Bold", marginTop: 6 }]}>
            Payment methods accepted: Bank Wire Transfer (T/T), Confirmed Irrevocable L/C at Sight, Cash Against Documents (subject to approval)
          </Text>
        </View>

        <Text style={s.sectionTitle}>Bank Details</Text>
        <View style={s.box}>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>Bank:</Text><Text>{bank.bank_name}</Text></View>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>Address:</Text><Text style={{ flex: 1 }}>{bank.bank_address}</Text></View>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>Account:</Text><Text>{bank.account_number}</Text></View>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>SWIFT/BIC:</Text><Text>{bank.swift_bic}</Text></View>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>IBAN:</Text><Text style={{ fontFamily: "Courier" }}>{bank.iban}</Text></View>
          <View style={{ flexDirection: "row" }}><Text style={{ width: 90, fontFamily: "Helvetica-Bold" }}>Beneficiary:</Text><Text>{bank.company_name}</Text></View>
        </View>

        <Text style={s.sectionTitle}>Terms &amp; Conditions</Text>
        {TNC.map((t, i) => (
          <Text key={i} style={s.tncLine}>{i + 1}. {t}</Text>
        ))}

        {v.notes ? (
          <>
            <Text style={s.sectionTitle}>Client Notes</Text>
            <Text style={s.p}>{v.notes}</Text>
          </>
        ) : null}

        <View style={s.footer}>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>DIJA Natural Stone</Text>
            <Text>10031 Sok. No: 14, AOSB</Text>
            <Text>Çiğli 35620 - İzmir - Türkiye</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text>Tax ID: 123-456-7890</Text>
            <Text>info@dijastones.com — www.dijastones.com</Text>
            <Text>+90 232 556 12 00</Text>
          </View>
        </View>
        <Text style={{ textAlign: "center", fontSize: 6.5, color: "#999", marginTop: 6 }}>
          This is a computer-generated document. No signature is required. — {v.id}
        </Text>
      </Page>
    </Document>
  );
}

export async function generateProformaPdf(v: InvoiceView): Promise<Buffer> {
  return renderToBuffer(<ProformaDocument v={v} />);
}
