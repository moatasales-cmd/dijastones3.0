"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { flagSvg } from "@/components/flags";

interface Ui {
  signIn: string;
  light: string;
  dark: string;
  menu: string;
  close: string;
  toggleSub: string;
  loggedIn: boolean;
  accountLabel: string;
  accountHref: string;
}

function setLocale(code: Locale) {
  document.cookie = `lang=${code};path=/;max-age=${60 * 60 * 24 * 365}`;
  // On a locale-prefixed URL (/fr/..., served for SEO by middleware.ts) the
  // path outranks the cookie, so a plain reload would keep the old language.
  // Navigate to the same page under the new locale's URL instead.
  const path = window.location.pathname;
  const seg = path.split("/")[1];
  const isPrefixed = (locales as readonly string[]).includes(seg);
  if (isPrefixed) {
    const rest = path.slice(seg.length + 1) || "/";
    window.location.href = code === "en" ? rest : `/${code}${rest === "/" ? "" : rest}`;
  } else {
    window.location.reload();
  }
}

// Declared at module scope (not inside Header) so React treats them as the
// same component type across renders — defining a component inline in a
// render body makes React remount its whole DOM subtree (losing open/closed
// state, event bindings, CSS transitions) every time any Header state
// changes, which produced hard-to-reproduce "the dropdown didn't open"
// interaction bugs.
function ThemeToggle({
  theme,
  applyTheme,
  labels,
}: {
  theme: "light" | "dark";
  applyTheme: (tm: "light" | "dark") => void;
  labels: { light: string; dark: string };
}) {
  return (
    <div className="theme-toggle-group">
      {(["light", "dark"] as const).map((tm) => (
        <button
          key={tm}
          className={`theme-toggle-btn${theme === tm ? " active" : ""}`}
          data-theme={tm}
          aria-label={tm === "light" ? labels.light : labels.dark}
          onClick={() => applyTheme(tm)}
        >
          <i className={`fa-regular ${tm === "light" ? "fa-sun" : "fa-moon"}`} />
        </button>
      ))}
    </div>
  );
}

function LangSwitcher({
  locale,
  langOpen,
  setLangOpen,
}: {
  locale: Locale;
  langOpen: boolean;
  setLangOpen: (fn: (v: boolean) => boolean) => void;
}) {
  return (
    <div className="lang-switcher">
      <button
        className="lang-current"
        aria-label="Language"
        type="button"
        aria-expanded={langOpen}
        onClick={() => setLangOpen((v) => !v)}
      >
        <span className="lang-flag">{flagSvg[locale]}</span>
        <span className="lang-name">{localeNames[locale]}</span>
        <svg className="lang-chevron" width="10" height="6" viewBox="0 0 10 6">
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul className="lang-dropdown" style={{ display: langOpen ? "block" : undefined }}>
        {locales
          .filter((c) => c !== locale)
          .map((c) => (
            <li key={c}>
              <a
                href="#"
                data-lang={c}
                onClick={(e) => {
                  e.preventDefault();
                  setLocale(c);
                }}
              >
                <span className="lang-flag">{flagSvg[c]}</span> {localeNames[c]}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default function Header({
  locale,
  nav,
  ui,
}: {
  locale: Locale;
  nav: NavItem[];
  ui: Ui;
}) {
  const pathname = usePathname();
  const activeSeg = pathname.split("/").filter(Boolean)[0] ?? "home";
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.className = `${isHome ? "home " : ""}page-${activeSeg}`;
  }, [isHome, activeSeg]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".nav-parent")) setOpenDropdown(null);
      if (!target.closest(".lang-switcher")) setLangOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const applyTheme = (tm: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", tm);
    try {
      localStorage.setItem("theme", tm);
    } catch {}
    setTheme(tm);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenMobileSub(null);
  };

  return (
    <>
      <header ref={headerRef} className={scrolled ? "scrolled" : ""}>
        <div className="header-inner">
          <Link href="/" className="logo" aria-label="DIJA Natural Stone">
            <img
              src="/assets/images/logo-dark.png"
              alt="DIJA Natural Stone"
              className="logo-img logo-light-mode"
            />
            <img
              src="/assets/images/logo-light.png"
              alt="DIJA Natural Stone"
              className="logo-img logo-dark-mode"
            />
          </Link>

          <nav className="nav-main" aria-label={ui.menu}>
            {nav.map((item) => {
              const active = activeSeg === item.seg;
              if (item.children) {
                const open = openDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className={`nav-parent${open ? " open" : ""}`}
                  >
                    <Link
                      href={item.href}
                      className="nav-parent-label"
                      aria-current={active ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenDropdown(open ? null : item.label);
                      }}
                    >
                      {item.label}
                    </Link>
                    <button
                      className="nav-caret"
                      aria-label={ui.toggleSub}
                      aria-expanded={open}
                      onClick={() => setOpenDropdown(open ? null : item.label)}
                    >
                      <i className="fa-solid fa-chevron-down" />
                    </button>
                    <div className="nav-dropdown">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={activeSeg === child.seg ? "page" : undefined}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="nav-auth-link">
              <Link href={ui.accountHref}>
                <i className={`fa-solid ${ui.loggedIn ? "fa-user" : "fa-sign-in-alt"}`} />{" "}
                {ui.accountLabel}
              </Link>
            </span>
          </nav>

          <LangSwitcher locale={locale} langOpen={langOpen} setLangOpen={setLangOpen} />
          <ThemeToggle theme={theme} applyTheme={applyTheme} labels={{ light: ui.light, dark: ui.dark }} />

          <button
            className="menu-toggle"
            aria-label={ui.menu}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>

      <nav
        id="mobileNav"
        className={`mobile-nav${mobileOpen ? " open" : ""}`}
        aria-label={ui.menu}
      >
        <button className="menu-close" onClick={closeMobile}>
          <i className="fa-solid fa-xmark" /> {ui.close}
        </button>
        <div className="mobile-nav-links">
          {nav.map((item) => {
            const active = activeSeg === item.seg;
            if (item.children) {
              const open = openMobileSub === item.label;
              return (
                // The stylesheet drives expansion via `.mobile-nav-parent.open`
                // (max-height transition on .mobile-subnav) — the class must go
                // on the parent, not inline display on the subnav.
                <div
                  key={item.label}
                  className={`mobile-nav-parent${open ? " open" : ""}`}
                >
                  <div
                    className="mobile-nav-header"
                    onClick={() => setOpenMobileSub(open ? null : item.label)}
                  >
                    <span
                      className="mobile-nav-parent-label"
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                    <i className="fa-solid fa-chevron-down mobile-caret" />
                  </div>
                  <div className="mobile-subnav">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMobile}
                        aria-current={activeSeg === child.seg ? "page" : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="nav-auth-link">
            <Link href={ui.accountHref} onClick={closeMobile}>
              <i className={`fa-solid ${ui.loggedIn ? "fa-user" : "fa-sign-in-alt"}`} />{" "}
              {ui.accountLabel}
            </Link>
          </span>
          <LangSwitcher locale={locale} langOpen={langOpen} setLangOpen={setLangOpen} />
          <ThemeToggle theme={theme} applyTheme={applyTheme} labels={{ light: ui.light, dark: ui.dark }} />
        </div>
      </nav>
    </>
  );
}
