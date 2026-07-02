import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminLogout from "@/components/AdminLogout";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "fa-gauge-high" },
  { href: "/admin/stones", label: "Stones", icon: "fa-cube" },
  { href: "/admin/clients", label: "Clients", icon: "fa-users" },
  { href: "/admin/leads", label: "Leads", icon: "fa-inbox" },
  { href: "/admin/proformas", label: "Proformas", icon: "fa-file-invoice" },
  { href: "/admin/posts", label: "Journal", icon: "fa-newspaper" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex bg-zinc-100 text-zinc-900">
      <aside className="w-56 shrink-0 bg-zinc-900 text-zinc-300 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="text-white font-semibold tracking-wide">DIJA</div>
          <div className="text-xs text-zinc-500">Admin CRM</div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <i className={`fa-solid ${n.icon} w-4 text-center`} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            <i className="fa-solid fa-arrow-left" /> Site
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
