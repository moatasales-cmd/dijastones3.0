import { prisma } from "@/lib/prisma";

export const metadata = { title: "Proformas — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2 whitespace-nowrap";
const td = "px-4 py-2 align-top";
const money = (v: number | null) =>
  "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface ClientSnap { name?: string; email?: string }

export default async function AdminProformas() {
  const proformas = await prisma.proforma.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Proformas ({proformas.length})</h1>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className={th}>ID</th>
              <th className={th}>Client</th>
              <th className={th}>Destination</th>
              <th className={th}>Incoterm</th>
              <th className={th}>Total</th>
              <th className={th}>Status</th>
              <th className={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {proformas.map((p) => {
              const c = (p.client ?? {}) as ClientSnap;
              return (
                <tr key={p.id} className="border-b border-zinc-50">
                  <td className={td + " font-mono text-xs"}>{p.id}</td>
                  <td className={td}>{c.name || "—"}<br /><span className="text-zinc-400">{c.email}</span></td>
                  <td className={td}>{p.destinationCountry}</td>
                  <td className={td}>{p.incoterm}</td>
                  <td className={td + " font-medium"}>{money(p.grandTotal)}</td>
                  <td className={td}>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs">{p.status}</span>
                  </td>
                  <td className={td + " text-zinc-400 whitespace-nowrap"}>{p.createdAt?.slice(0, 10)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
