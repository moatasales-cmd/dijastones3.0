import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import ProformaBuilder, { type Priced, type ClientPrefill, type Row, type EditPrefill } from "@/components/ProformaBuilder";
import { SIZE_CATEGORIES_METRIC, SIZE_CATEGORIES_IMPERIAL, SQM_TO_SQF } from "@/lib/proforma-engine";
import { buildProformaBuilderStrings } from "@/lib/proforma-builder-strings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.proforma") };
}

interface SavedItem {
  stone_id?: string;
  grade?: string;
  finish?: string;
  category?: string;
  is_custom?: boolean;
  width_cm?: number;
  height_cm?: number;
  thickness?: string;
  total_m2?: number;
}

export default async function EditProformaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getT();
  const client = await getCurrentClient();
  if (!client) redirect("/login");

  const pf = await prisma.proforma.findUnique({ where: { id } });
  if (!pf || pf.clientId !== client.id) notFound();
  if (pf.status !== "draft") redirect(`/proforma/${id}`);

  const stoneRows = await prisma.stone.findMany({
    where: { p: { not: null } },
    select: { id: true, n: true, p: true, pPremium: true, ty: true, c: true, g: true },
    orderBy: { n: "asc" },
  });
  const stones: Priced[] = stoneRows.map((s) => ({
    id: s.id,
    n: s.n,
    p: s.p as number,
    pPremium: s.pPremium,
    ty: s.ty,
    c: s.c,
    image: (Array.isArray(s.g) ? (s.g as string[])[0] : null) ?? null,
  }));

  const unitSystem: "sqm" | "sqf" = pf.unitSystem === "sqf" ? "sqf" : "sqm";
  const categories = unitSystem === "sqf" ? SIZE_CATEGORIES_IMPERIAL : SIZE_CATEGORIES_METRIC;

  const savedItems = Array.isArray(pf.items) ? (pf.items as SavedItem[]) : [];
  const rows: Row[] = savedItems.map((it) => {
    const isCustom = it.is_custom || it.category === "custom" || it.category === "custom-imperial";
    const category = !isCustom ? categories.find((c) => c.id === it.category) : undefined;
    const sizeIndex = category
      ? category.sizes.findIndex((sz) => sz.w === it.width_cm && sz.h === it.height_cm)
      : null;
    const totalM2 = it.total_m2 ?? 0;
    const areaDisplay = unitSystem === "sqf" ? totalM2 * SQM_TO_SQF : totalM2;
    return {
      stoneId: it.stone_id ?? "",
      grade: it.grade ?? "Standard",
      finish: it.finish ?? "Polished",
      categoryId: isCustom ? "custom" : it.category ?? "",
      sizeIndex: sizeIndex != null && sizeIndex >= 0 ? sizeIndex : null,
      customWidth: isCustom ? String(it.width_cm ?? "") : "",
      customHeight: isCustom ? String(it.height_cm ?? "") : "",
      thickness: it.thickness ?? "2 cm",
      area: areaDisplay ? String(Math.round(areaDisplay * 100) / 100) : "",
    };
  });

  const clientData = (pf.client ?? {}) as Record<string, unknown>;
  const prefill: ClientPrefill = {
    name: String(clientData.name ?? ""),
    email: String(clientData.email ?? client.email),
    company: String(clientData.company ?? ""),
    phone: String(clientData.phone ?? ""),
    address: String(clientData.address ?? ""),
    city: String(clientData.city ?? ""),
    country: String(clientData.country ?? ""),
  };

  const edit: EditPrefill = {
    proformaId: pf.id,
    unitSystem,
    rows: rows.length ? rows : [],
    destinationCountry: pf.destinationCountry ?? "",
    destinationPort: pf.destinationPort ?? "",
    incoterm: pf.incoterm ?? "FOB",
    paymentTerm: pf.paymentTerm ?? "TT_30_70",
    notes: pf.notes ?? "",
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">Edit proforma</div>
          <h1 className="hero-title">{pf.id}</h1>
          <p>Update your selection below and save — the pricing will be recalculated automatically.</p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container">
          <ProformaBuilder stones={stones} client={prefill} edit={edit} strings={buildProformaBuilderStrings(t)} />
        </div>
      </section>
    </>
  );
}
