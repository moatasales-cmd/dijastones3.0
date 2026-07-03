import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import Card from "@/components/admin/Card";

export const metadata = { title: "Clients — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2.5 whitespace-nowrap";
const td = "px-4 py-2.5 align-top";

export default async function AdminClients() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { favorites: true } } },
  });

  return (
    <div>
      <PageHeader title="Clients" count={clients.length} />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Company</th>
              <th className={th}>Country</th>
              <th className={th}>Verified</th>
              <th className={th}>Favorites</th>
              <th className={th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td + " font-medium text-zinc-900"}>{c.name || c.fullName || "—"}</td>
                <td className={td}>{c.email}</td>
                <td className={td}>{c.companyName || "—"}</td>
                <td className={td}>{c.country || "—"}</td>
                <td className={td}>
                  {c.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <i className="fa-solid fa-circle-check" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </td>
                <td className={td}>{c._count.favorites}</td>
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{c.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No clients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
