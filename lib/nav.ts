// Primary navigation — mirrors the old inc/nav.php structure.
// Labels are hard-coded English for now; Phase 1 wires these to the
// i18n message system (en/fr) migrated from lang/*.php.

export interface NavChild {
  label: string;
  href: string;
  /** route segment used for active-state matching */
  seg: string;
}

export interface NavItem {
  label: string;
  href: string;
  seg: string;
  children?: NavChild[];
}

export const nav: NavItem[] = [
  {
    label: "Stone",
    href: "/materials",
    seg: "materials",
    children: [
      { label: "Materials", href: "/materials", seg: "materials" },
      { label: "Collections", href: "/collections", seg: "collections" },
      { label: "Quarries", href: "/quarries", seg: "quarries" },
    ],
  },
  {
    label: "Atelier",
    href: "/heritage",
    seg: "heritage",
    children: [
      { label: "Heritage", href: "/heritage", seg: "heritage" },
      { label: "Journal", href: "/journal", seg: "journal" },
      { label: "Sustainability", href: "/sustainability", seg: "sustainability" },
    ],
  },
  { label: "Projects", href: "/projects", seg: "projects" },
  {
    label: "Trade",
    href: "/trade",
    seg: "trade",
    children: [
      { label: "Trade Program", href: "/trade", seg: "trade" },
      { label: "Proforma Builder", href: "/proforma", seg: "proforma" },
    ],
  },
  { label: "Contact", href: "/contact", seg: "contact" },
];
