import { prisma } from "@/lib/prisma";

export const metadata = { title: "Clients — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2 whitespace-nowrap";
const td = "px-4 py-2 align-top";

export default async function AdminClients() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { favorites: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Clients ({clients.length})</h1>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-x-auto">
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
              <tr key={c.id} className="border-b border-zinc-50">
                <td className={td + " font-medium"}>{c.name || c.fullName || "—"}</td>
                <td className={td}>{c.email}</td>
                <td className={td}>{c.companyName || "—"}</td>
                <td className={td}>{c.country || "—"}</td>
                <td className={td}>
                  {c.verified ? (
                    <span className="text-green-600"><i className="fa-solid fa-circle-check" /></span>
                  ) : (
                    <span className="text-zinc-300"><i className="fa-solid fa-circle" /></span>
                  )}
                </td>
                <td className={td}>{c._count.favorites}</td>
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{c.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
