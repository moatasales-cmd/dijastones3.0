"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/nav";

/** Which nav segment is active, derived from the current path. */
function useActiveSeg(): string {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0] ?? "home";
  return seg;
}

export default function Header() {
  const pathname = usePathname();
  const activeSeg = useActiveSeg();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const headerRef = useRef<HTMLElement>(null);

  // Set the body class so CSS can style home vs. inner pages (transparent
  // hero header, per-page hooks). Mirrors the old body class="home page-x".
  useEffect(() => {
    document.body.className = `${isHome ? "home " : ""}page-${activeSeg}`;
  }, [isHome, activeSeg]);

  // Sticky-header scroll state.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync theme state from the (already-applied) data-theme attribute.
  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";
    setTheme(current);
  }, []);

  // Close desktop dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".nav-parent")) setOpenDropdown(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const applyTheme = (t: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("theme", t);
    } catch {}
    setTheme(t);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenMobileSub(null);
  };

  const ThemeToggle = () => (
    <div className="theme-toggle-group">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          className={`theme-toggle-btn${theme === t ? " active" : ""}`}
          data-theme={t}
          aria-label={t === "light" ? "Light mode" : "Dark mode"}
          onClick={() => applyTheme(t)}
        >
          <i className={`fa-regular ${t === "light" ? "fa-sun" : "fa-moon"}`} />
        </button>
      ))}
    </div>
  );

  const LangSwitcher = () => (
    // Visual only for now; real EN/FR switching arrives with i18n (Phase 1).
    <div className="lang-switcher">
      <button className="lang-current" aria-label="Language" type="button">
        <svg viewBox="0 0 60 30" width="18" height="9" style={{ verticalAlign: "middle" }}>
          <rect width="60" height="30" fill="#012169" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="4" />
          <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
        </svg>
        <span>EN</span>
      </button>
    </div>
  );

  return (
    <>
      <header ref={headerRef} className={scrolled ? "scrolled" : ""}>
        <div className="header-inner">
          <Link href="/" className="logo" aria-label="DIJA Marble">
            <img
              src="/assets/images/logo-dark.png"
              alt="DIJA Marble"
              className="logo-img logo-light-mode"
            />
            <img
              src="/assets/images/logo-light.png"
              alt="DIJA Marble"
              className="logo-img logo-dark-mode"
            />
          </Link>

          <nav className="nav-main" aria-label="Menu">
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
                      aria-label="Toggle submenu"
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
              <Link href="/login">
                <i className="fa-solid fa-sign-in-alt" /> Sign In
              </Link>
            </span>
          </nav>

          <LangSwitcher />
          <ThemeToggle />

          <button
            className="menu-toggle"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>

      <nav
        id="mobileNav"
        className={`mobile-nav${mobileOpen ? " open" : ""}`}
        aria-label="Menu"
      >
        <button className="menu-close" onClick={closeMobile}>
          <i className="fa-solid fa-xmark" /> Close menu
        </button>
        <div className="mobile-nav-links">
          {nav.map((item) => {
            const active = activeSeg === item.seg;
            if (item.children) {
              const open = openMobileSub === item.label;
              return (
                <div key={item.label} className="mobile-nav-parent">
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
                    <i
                      className={`fa-solid fa-chevron-down mobile-caret${
                        open ? " open" : ""
                      }`}
                    />
                  </div>
                  <div
                    className="mobile-subnav"
                    style={{ display: open ? "flex" : undefined }}
                  >
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
            <Link href="/login" onClick={closeMobile}>
              <i className="fa-solid fa-sign-in-alt" /> Sign In
            </Link>
          </span>
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}
