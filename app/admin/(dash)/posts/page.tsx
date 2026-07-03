import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import Card from "@/components/admin/Card";

export const metadata = { title: "Journal — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2.5";
const td = "px-4 py-2.5";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    select: { id: true, t: true, c: true, a: true, dt: true, img: true },
  });

  return (
    <div>
      <PageHeader
        title="Journal posts"
        count={posts.length}
        actions={
          <Link
            href="/admin/posts/new"
            className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <i className="fa-solid fa-plus" /> New post
          </Link>
        }
      />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}></th>
              <th className={th}>Title</th>
              <th className={th}>Category</th>
              <th className={th}>Author</th>
              <th className={th}>Date</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td}>
                  <div className="w-10 h-10 rounded-md bg-zinc-100 overflow-hidden flex items-center justify-center">
                    {p.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-regular fa-image text-zinc-300" />
                    )}
                  </div>
                </td>
                <td className={td + " font-medium text-zinc-900"}>{p.t}</td>
                <td className={td}>{p.c}</td>
                <td className={td}>{p.a}</td>
                <td className={td}>{p.dt}</td>
                <td className={td + " text-right"}>
                  <Link href={`/admin/posts/${p.id}`} className="text-amber-700 hover:underline font-medium">Edit</Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">No journal posts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
