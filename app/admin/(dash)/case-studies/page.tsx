import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import CaseStudiesTable from "@/components/admin/CaseStudiesTable";

export const metadata = { title: "Case Studies — Admin" };

export default async function AdminCaseStudies() {
  const cases = await prisma.caseStudy.findMany({
    select: { id: true, title: true, architect: true, location: true, year: true, articleId: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Case studies"
        count={cases.length}
        actions={
          <Link
            href="/admin/case-studies/new"
            className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="fa-solid fa-plus" /> New case study
          </Link>
        }
      />
      <CaseStudiesTable cases={cases} />
    </div>
  );
}
