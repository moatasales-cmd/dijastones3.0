import type { Locale } from "@/lib/i18n";

// Small flag icons for the language switchers (site header + catalogue print
// view). viewBox 0 0 60 30, rendered at 18×9. Arabic uses the Tunisian flag
// and Farsi the Iranian flag, per an explicit product decision — DIJA's roots
// are Tunisian, and these are the buyer markets the two languages target.
export const flagSvg: Record<Locale, React.ReactNode> = {
  en: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="4" />
      <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#fff" />
      <rect width="20" height="30" fill="#002395" />
      <rect x="40" width="20" height="30" fill="#ed2939" />
    </svg>
  ),
  es: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#AA151B" />
      <rect y="7.5" width="60" height="15" fill="#F1BF00" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#FF0000" />
      <rect width="24" height="30" fill="#046A38" />
      <circle cx="24" cy="15" r="6" fill="#FFCC29" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="10" fill="#fff" />
      <rect y="10" width="60" height="10" fill="#0039A6" />
      <rect y="20" width="60" height="10" fill="#D52B1E" />
    </svg>
  ),
  el: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#0D5EAF" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} y={i * 6.67} width="60" height="3.33" fill="#fff" />
      ))}
      <rect width="22" height="16.67" fill="#0D5EAF" />
      <rect x="8.5" width="5" height="16.67" fill="#fff" />
      <rect y="6" width="22" height="5" fill="#fff" />
    </svg>
  ),
  // Tunisia — red field, white disc, red crescent embracing a red star.
  ar: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#E70013" />
      <circle cx="30" cy="15" r="8.5" fill="#fff" />
      <circle cx="29.5" cy="15" r="5.2" fill="#E70013" />
      <circle cx="31.3" cy="15" r="4.1" fill="#fff" />
      <polygon points="32.2,11.7 33.05,14.1 35.6,14.1 33.5,15.6 34.3,18 32.2,16.5 30.1,18 30.9,15.6 28.8,14.1 31.35,14.1" fill="#E70013" />
    </svg>
  ),
  zh: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#DE2910" />
      <polygon points="9,5 11,11 17,11 12,14.5 14,20 9,16.5 4,20 6,14.5 1,11 7,11" fill="#FFDE00" />
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#fff" />
      <circle cx="30" cy="15" r="9" fill="#BC002D" />
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#E30A17" />
      <circle cx="24" cy="15" r="7.5" fill="#fff" />
      <circle cx="26" cy="15" r="6" fill="#E30A17" />
      <polygon points="34,15 39.5,16.8 36.3,12 36.3,18 39.5,13.2" fill="#fff" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="30" fill="#fff" />
      <rect width="20" height="30" fill="#008C45" />
      <rect x="40" width="20" height="30" fill="#CD212A" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="10" fill="#000" />
      <rect y="10" width="60" height="10" fill="#DD0000" />
      <rect y="20" width="60" height="10" fill="#FFCE00" />
    </svg>
  ),
  // Iran — green/white/red tricolor with a simplified red central emblem.
  fa: (
    <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
      <rect width="60" height="10" fill="#239F40" />
      <rect y="10" width="60" height="10" fill="#fff" />
      <rect y="20" width="60" height="10" fill="#DA0000" />
      <g fill="#DA0000">
        <rect x="29.4" y="12.5" width="1.2" height="5" rx="0.3" />
        <path d="M27.9 13.1a2 2 0 0 0 0 3.8 2.7 2.7 0 0 1 0-3.8z" />
        <path d="M32.1 13.1a2 2 0 0 1 0 3.8 2.7 2.7 0 0 0 0-3.8z" />
        <path d="M26.1 13.5a2.4 2.4 0 0 0 0 3 3 3 0 0 1 0-3z" />
        <path d="M33.9 13.5a2.4 2.4 0 0 1 0 3 3 3 0 0 0 0-3z" />
      </g>
    </svg>
  ),
};
