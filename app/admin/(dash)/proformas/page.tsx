import { prisma } from "@/lib/prisma";
import ProformaStatusSelect from "@/components/ProformaStatusSelect";
import PageHeader from "@/components/admin/PageHeader";
import Card from "@/components/admin/Card";

export const metadata = { title: "Proformas — Admin" };

const th = "text-left font-medium text-zinc-500 px-4 py-2.5 whitespace-nowrap";
const td = "px-4 py-2.5 align-top";
const money = (v: number | null) =>
  "$" + (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface ClientSnap { name?: string; email?: string }

export default async function AdminProformas() {
  const proformas = await prisma.proforma.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Proformas" count={proformas.length} />
      <Card className="overflow-x-auto">
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
                <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className={td + " font-mono text-xs text-zinc-500"}>{p.id}</td>
                  <td className={td}>
                    <span className="text-zinc-900 font-medium">{c.name || "—"}</span>
                    <br /><span className="text-zinc-400">{c.email}</span>
                  </td>
                  <td className={td}>{p.destinationCountry}</td>
                  <td className={td}>{p.incoterm}</td>
                  <td className={td + " font-medium text-zinc-900"}>{money(p.grandTotal)}</td>
                  <td className={td}>
                    <ProformaStatusSelect id={p.id} status={p.status} />
                  </td>
                  <td className={td + " text-zinc-400 whitespace-nowrap"}>{p.createdAt?.slice(0, 10)}</td>
                </tr>
              );
            })}
            {proformas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No proformas yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
