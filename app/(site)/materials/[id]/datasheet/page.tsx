import { redirect } from "next/navigation";

// Legacy route — the datasheet lives at /datasheet/[id] (standalone print
// document, no site chrome). Kept as a redirect so old links keep working.
export default async function LegacyDatasheetRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/datasheet/${encodeURIComponent(id)}`);
}
