import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import Card from "@/components/admin/Card";

export const metadata = { title: "Leads — Admin" };

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div role="heading" aria-level={2} className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        {title} <span className="text-zinc-400 font-normal normal-case">({count})</span>
      </div>
      <Card className="overflow-x-auto">{children}</Card>
    </section>
  );
}

const th = "text-left font-medium text-zinc-500 px-4 py-2.5 whitespace-nowrap";
const td = "px-4 py-2.5 align-top";

export default async function AdminLeads() {
  const [contacts, quotes, trade] = await Promise.all([
    prisma.contact.findMany({ orderBy: { received: "desc" } }),
    prisma.quoteRequest.findMany({ orderBy: { received: "desc" } }),
    prisma.tradeApplication.findMany({ orderBy: { received: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Leads" />

      <Section title="Contact messages" count={contacts.length}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Message</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{c.received}</td>
                <td className={td + " font-medium text-zinc-900"}>{c.name}</td>
                <td className={td}>{c.email}</td>
                <td className={td + " max-w-md"}>{c.message}</td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td className="px-4 py-8 text-center text-zinc-400" colSpan={4}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>

      <Section title="Quote requests" count={quotes.length}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Stone</th><th className={th}>Area</th><th className={th}>Contact</th></tr></thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{q.received}</td>
                <td className={td + " font-medium text-zinc-900"}>{q.name}</td>
                <td className={td}>{q.stoneName}</td>
                <td className={td}>{q.area} {q.areaUnit}</td>
                <td className={td}>{q.email}<br /><span className="text-zinc-400">{q.phone}</span></td>
              </tr>
            ))}
            {quotes.length === 0 && <tr><td className="px-4 py-8 text-center text-zinc-400" colSpan={5}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>

      <Section title="Trade applications" count={trade.length}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Company</th><th className={th}>Role</th><th className={th}>Volume</th><th className={th}>Project</th></tr></thead>
          <tbody>
            {trade.map((t) => (
              <tr key={t.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{t.received}</td>
                <td className={td + " font-medium text-zinc-900"}>{t.name}<br /><span className="text-zinc-400 font-normal">{t.email}</span></td>
                <td className={td}>{t.company}</td>
                <td className={td}>{t.role}</td>
                <td className={td}>{t.volume}</td>
                <td className={td + " max-w-xs"}>{t.projectExample}</td>
              </tr>
            ))}
            {trade.length === 0 && <tr><td className="px-4 py-8 text-center text-zinc-400" colSpan={6}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
