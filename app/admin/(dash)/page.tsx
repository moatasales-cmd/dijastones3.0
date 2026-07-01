import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <Link href={href} className="bg-white rounded-lg border border-zinc-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-semibold text-zinc-900">{value}</span>
        <i className={`fa-solid ${icon} text-amber-700/70 text-xl`} />
      </div>
      <div className="text-sm text-zinc-500 mt-1">{label}</div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const c = await counts();
  const recentQuotes = await prisma.quoteRequest.findMany({ orderBy: { received: "desc" }, take: 5 });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Stones" value={c.stones} href="/admin/stones" icon="fa-cube" />
        <Stat label="Clients" value={c.clients} href="/admin/clients" icon="fa-users" />
        <Stat label="Proformas" value={c.proformas} href="/admin/proformas" icon="fa-file-invoice" />
        <Stat label="Contact msgs" value={c.contacts} href="/admin/leads" icon="fa-envelope" />
        <Stat label="Quote requests" value={c.quotes} href="/admin/leads" icon="fa-calculator" />
        <Stat label="Trade apps" value={c.trade} href="/admin/leads" icon="fa-handshake" />
        <Stat label="Subscribers" value={c.subscribers} href="/admin/leads" icon="fa-inbox" />
      </div>

      <h2 className="text-lg font-semibold mt-10 mb-3">Recent quote requests</h2>
      <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100">
        {recentQuotes.length === 0 && <p className="p-4 text-sm text-zinc-500">No quote requests yet.</p>}
        {recentQuotes.map((q) => (
          <div key={q.id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{q.name}</span> · {q.stoneName}
              <div className="text-zinc-500">{q.email} · {q.area} {q.areaUnit}</div>
            </div>
            <span className="text-zinc-400">{q.received}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
