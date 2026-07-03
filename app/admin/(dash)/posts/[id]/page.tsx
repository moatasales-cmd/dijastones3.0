import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor, { type PostData } from "@/components/PostEditor";
import PageHeader from "@/components/admin/PageHeader";

export const metadata = { title: "Edit post — Admin" };

export default async function AdminPostEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let post: PostData;
  if (isNew) {
    post = { id: "" };
  } else {
    const p = await prisma.post.findUnique({ where: { id } });
    if (!p) notFound();
    post = p as PostData;
  }

  return (
    <div>
      <PageHeader title={isNew ? "New post" : post.t ?? post.id} backHref="/admin/posts" backLabel="Journal" />
      <PostEditor post={post} isNew={isNew} />
    </div>
  );
}
