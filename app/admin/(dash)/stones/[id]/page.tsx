import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoneEditor, { type StoneData } from "@/components/StoneEditor";
import DeleteStoneButton from "@/components/DeleteStoneButton";

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
      <Link href="/admin/stones" className="text-sm text-zinc-500 hover:text-zinc-900">
        <i className="fa-solid fa-arrow-left" /> Stones
      </Link>
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-semibold">{isNew ? "New stone" : stone.n}</h1>
        {!isNew && (
          <DeleteStoneButton stoneId={stone.id} stoneName={stone.n ?? stone.id} redirectTo="/admin/stones" />
        )}
      </div>
      <StoneEditor stone={stone} isNew={isNew} />
    </div>
  );
}
