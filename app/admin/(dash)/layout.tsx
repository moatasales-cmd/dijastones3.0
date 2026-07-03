import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminLogout from "@/components/AdminLogout";
import AdminNav, { type NavItem } from "@/components/admin/AdminNav";

const NAV: NavItem[] = [
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
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">
      <aside className="w-60 shrink-0 bg-zinc-900 text-zinc-300 flex flex-col min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-serif font-semibold text-sm shrink-0">
            D
          </div>
          <div>
            <div className="text-white font-semibold tracking-wide leading-tight">DIJA</div>
            <div className="text-[11px] text-zinc-500 leading-tight">Admin CRM</div>
          </div>
        </div>
        <AdminNav items={NAV} />
        <div className="p-3 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-arrow-left" /> Back to site
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8 max-w-[1400px]">{children}</main>
    </div>
  );
}
