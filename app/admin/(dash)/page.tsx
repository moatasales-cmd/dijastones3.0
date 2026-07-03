import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card from "@/components/admin/Card";
import PageHeader from "@/components/admin/PageHeader";

export const metadata = { title: "Admin Dashboard" };

async function counts() {
  const [stones, clients, proformas, contacts, quotes, trade, subscribers] =
    await Promise.all([
      prisma.stone.count(),
      prisma.client.count(),
      prisma.proforma.count(),
      prisma.contact.count(),
      prisma.quoteRequest.count(),
      prisma.tradeApplication.count(),
      prisma.subscriber.count(),
    ]);
  return { stones, clients, proformas, contacts, quotes, trade, subscribers };
}

function Stat({ label, value, href, icon }: { label: string; value: number; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:shadow-md hover:border-amber-700/30 transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-semibold text-zinc-900">{value}</span>
        <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
          <i className={`fa-solid ${icon}`} />
        </span>
      </div>
      <div className="text-sm text-zinc-500 mt-2">{label}</div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const c = await counts();
  const recentQuotes = await prisma.quoteRequest.findMany({ orderBy: { received: "desc" }, take: 5 });

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Stones" value={c.stones} href="/admin/stones" icon="fa-cube" />
        <Stat label="Clients" value={c.clients} href="/admin/clients" icon="fa-users" />
        <Stat label="Proformas" value={c.proformas} href="/admin/proformas" icon="fa-file-invoice" />
        <Stat label="Contact msgs" value={c.contacts} href="/admin/leads" icon="fa-envelope" />
        <Stat label="Quote requests" value={c.quotes} href="/admin/leads" icon="fa-calculator" />
        <Stat label="Trade apps" value={c.trade} href="/admin/leads" icon="fa-handshake" />
        <Stat label="Subscribers" value={c.subscribers} href="/admin/leads" icon="fa-inbox" />
      </div>

      <div role="heading" aria-level={2} className="text-lg font-semibold mt-10 mb-3 text-zinc-800">Recent quote requests</div>
      <Card className="divide-y divide-zinc-100">
        {recentQuotes.length === 0 && (
          <div className="p-6 text-sm text-zinc-500 text-center">No quote requests yet.</div>
        )}
        {recentQuotes.map((q) => (
          <div key={q.id} className="p-4 flex items-center justify-between text-sm hover:bg-zinc-50 transition-colors">
            <div>
              <span className="font-medium text-zinc-900">{q.name}</span>
              <span className="text-zinc-400"> · </span>
              {q.stoneName}
                <div className="text-zinc-500">{q.email} · {q.area} {q.areaUnit}</div>
            </div>
            <span className="text-zinc-400 text-xs whitespace-nowrap">{q.received}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
