// Primary navigation — mirrors the old inc/nav.php structure.
// Labels are translation keys resolved on the server (resolveNav) and passed
// to the client Header as plain strings, so message data stays off the client.
import type { T } from "./translator";

interface NavChildCfg {
  key: string;
  href: string;
  seg: string;
}
interface NavItemCfg {
  key: string;
  href: string;
  seg: string;
  children?: NavChildCfg[];
}

export const navConfig: NavItemCfg[] = [
  {
    key: "nav.stone",
    href: "/materials",
    seg: "materials",
    children: [
      { key: "nav.stone.materials", href: "/materials", seg: "materials" },
      { key: "nav.stone.collections", href: "/collections", seg: "collections" },
      { key: "nav.stone.quarries", href: "/quarries", seg: "quarries" },
      { key: "nav.stone.case_studies", href: "/case-studies", seg: "case-studies" },
    ],
  },
  {
    key: "nav.atelier",
    href: "/heritage",
    seg: "heritage",
    children: [
      { key: "nav.atelier.heritage", href: "/heritage", seg: "heritage" },
      { key: "nav.atelier.journal", href: "/journal", seg: "journal" },
      { key: "nav.atelier.sustainability", href: "/sustainability", seg: "sustainability" },
    ],
  },
  { key: "nav.projects", href: "/projects", seg: "projects" },
  {
    key: "nav.trade",
    href: "/trade",
    seg: "trade",
    children: [
      { key: "nav.trade.trade_program", href: "/trade", seg: "trade" },
      { key: "nav.trade.proforma_builder", href: "/proforma", seg: "proforma" },
    ],
  },
  { key: "nav.contact", href: "/contact", seg: "contact" },
];

// Resolved shapes passed to client components.
export interface NavChild {
  label: string;
  href: string;
  seg: string;
}
export interface NavItem {
  label: string;
  href: string;
  seg: string;
  children?: NavChild[];
}

export function resolveNav(t: T): NavItem[] {
  return navConfig.map((item) => ({
    label: t(item.key),
    href: item.href,
    seg: item.seg,
    children: item.children?.map((c) => ({
      label: t(c.key),
      href: c.href,
      seg: c.seg,
    })),
  }));
}
