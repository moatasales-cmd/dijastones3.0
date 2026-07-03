import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoneEditor, { type StoneData } from "@/components/StoneEditor";
import DeleteStoneButton from "@/components/DeleteStoneButton";
import PageHeader from "@/components/admin/PageHeader";

export const metadata = { title: "Edit stone — Admin" };

export default async function AdminStoneEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let stone: StoneData;
  if (isNew) {
    stone = { id: "" };
  } else {
    const s = await prisma.stone.findUnique({ where: { id } });
    if (!s) notFound();
    stone = s as StoneData;
  }

  return (
    <div>
      <PageHeader
        title={isNew ? "New stone" : stone.n ?? stone.id}
        backHref="/admin/stones"
        backLabel="Stones"
        actions={
          !isNew && (
            <DeleteStoneButton stoneId={stone.id} stoneName={stone.n ?? stone.id} redirectTo="/admin/stones" />
          )
        }
      />
      <StoneEditor stone={stone} isNew={isNew} />
    </div>
  );
}
