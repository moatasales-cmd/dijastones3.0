import { prisma } from "@/lib/prisma";

export const metadata = { title: "Leads — Admin" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-x-auto">{children}</div>
    </section>
  );
}

const th = "text-left font-medium text-zinc-500 px-4 py-2 whitespace-nowrap";
const td = "px-4 py-2 align-top";

export default async function AdminLeads() {
  const [contacts, quotes, trade] = await Promise.all([
    prisma.contact.findMany({ orderBy: { received: "desc" } }),
    prisma.quoteRequest.findMany({ orderBy: { received: "desc" } }),
    prisma.tradeApplication.findMany({ orderBy: { received: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Leads</h1>

      <Section title={`Contact messages (${contacts.length})`}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Message</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{c.received}</td>
                <td className={td}>{c.name}</td>
                <td className={td}>{c.email}</td>
                <td className={td + " max-w-md"}>{c.message}</td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td className="p-4 text-zinc-500" colSpan={4}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>

      <Section title={`Quote requests (${quotes.length})`}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Stone</th><th className={th}>Area</th><th className={th}>Contact</th></tr></thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-zinc-50">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{q.received}</td>
                <td className={td}>{q.name}</td>
                <td className={td}>{q.stoneName}</td>
                <td className={td}>{q.area} {q.areaUnit}</td>
                <td className={td}>{q.email}<br />{q.phone}</td>
              </tr>
            ))}
            {quotes.length === 0 && <tr><td className="p-4 text-zinc-500" colSpan={5}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>

      <Section title={`Trade applications (${trade.length})`}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-100"><th className={th}>Received</th><th className={th}>Name</th><th className={th}>Company</th><th className={th}>Role</th><th className={th}>Volume</th><th className={th}>Project</th></tr></thead>
          <tbody>
            {trade.map((t) => (
              <tr key={t.id} className="border-b border-zinc-50">
                <td className={td + " text-zinc-400 whitespace-nowrap"}>{t.received}</td>
                <td className={td}>{t.name}<br /><span className="text-zinc-400">{t.email}</span></td>
                <td className={td}>{t.company}</td>
                <td className={td}>{t.role}</td>
                <td className={td}>{t.volume}</td>
                <td className={td + " max-w-xs"}>{t.projectExample}</td>
              </tr>
            ))}
            {trade.length === 0 && <tr><td className="p-4 text-zinc-500" colSpan={6}>None yet.</td></tr>}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
