"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export default function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
      {items.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-amber-700/15 text-amber-400"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <i
              className={`fa-solid ${n.icon} w-4 text-center text-[13px] ${
                active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span className="flex-1">{n.label}</span>
            {!!n.badge && (
              <span className="text-[11px] font-semibold bg-amber-700 text-white rounded-full px-1.5 py-0.5 leading-none min-w-[1.25rem] text-center">
                {n.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
