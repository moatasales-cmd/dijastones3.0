import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CaseStudyEditor, { type CaseStudyData } from "@/components/CaseStudyEditor";
import PageHeader from "@/components/admin/PageHeader";
import DeleteCaseStudyButton from "@/components/DeleteCaseStudyButton";

export const metadata = { title: "Edit case study — Admin" };

export default async function AdminCaseStudyEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let caseStudy: CaseStudyData;
  if (isNew) {
    caseStudy = { id: "" };
  } else {
    const c = await prisma.caseStudy.findUnique({ where: { id } });
    if (!c) notFound();
    caseStudy = c as CaseStudyData;
  }

  const stones = await prisma.stone.findMany({ select: { id: true, n: true }, orderBy: { n: "asc" } });

  return (
    <div>
      <PageHeader
        title={isNew ? "New case study" : caseStudy.title ?? caseStudy.id}
        backHref="/admin/case-studies"
        backLabel="Case studies"
        actions={!isNew ? <DeleteCaseStudyButton caseStudyId={caseStudy.id} title={caseStudy.title ?? caseStudy.id} redirectTo="/admin/case-studies" /> : undefined}
      />
      <CaseStudyEditor caseStudy={caseStudy} isNew={isNew} stones={stones} />
    </div>
  );
}
