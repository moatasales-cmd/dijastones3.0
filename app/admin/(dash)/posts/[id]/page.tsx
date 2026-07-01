import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor, { type PostData } from "@/components/PostEditor";

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
      <Link href="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-900">
        <i className="fa-solid fa-arrow-left" /> Journal
      </Link>
      <h1 className="text-2xl font-semibold my-4">{isNew ? "New post" : post.t}</h1>
      <PostEditor post={post} isNew={isNew} />
    </div>
  );
}
