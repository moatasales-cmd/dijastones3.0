import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Journal — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2";
const td = "px-4 py-2";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    select: { id: true, t: true, c: true, a: true, dt: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Journal posts ({posts.length})</h1>
        <Link href="/admin/posts/new" className="bg-zinc-900 text-white text-sm px-4 py-2 rounded hover:bg-zinc-800">
          <i className="fa-solid fa-plus" /> New post
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}>Title</th>
              <th className={th}>Category</th>
              <th className={th}>Author</th>
              <th className={th}>Date</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className={td + " font-medium"}>{p.t}</td>
                <td className={td}>{p.c}</td>
                <td className={td}>{p.a}</td>
                <td className={td}>{p.dt}</td>
                <td className={td + " text-right"}>
                  <Link href={`/admin/posts/${p.id}`} className="text-amber-700 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
