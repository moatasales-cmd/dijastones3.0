import Link from "next/link";

export default function PageHeader({
  title,
  count,
  backHref,
  backLabel,
  actions,
}: {
  title: string;
  count?: number;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-2 transition-colors">
          <i className="fa-solid fa-arrow-left text-xs" /> {backLabel}
        </Link>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* div, not h1: the site's global h1/h2/h3 rule (Playfair Display,
            clamp()-based font-size) sits outside Tailwind's cascade layers
            and beats any Tailwind text utility on a real heading tag. */}
        <div role="heading" aria-level={1} className="text-2xl font-semibold text-zinc-900">
          {title}
          {count !== undefined && <span className="text-zinc-400 font-normal"> ({count})</span>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
