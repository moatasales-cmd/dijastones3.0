import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getT } from "@/lib/i18n-server";
import { resolveNav } from "@/lib/nav";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: {
      default: t("title.home"),
      template: `%s — ${t("title.suffix")}`,
    },
    description: t("meta.description"),
  };
}

// Blocking theme init — sets data-theme before first paint so there is
// no flash of the wrong theme (mirrors the old inline <head> script).
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { t, locale } = await getT();
  const nav = resolveNav(t);
  const ui = {
    signIn: t("nav.sign_in"),
    light: t("theme.light"),
    dark: t("theme.dark"),
    menu: t("mobile.menu"),
    close: t("mobile.close"),
    toggleSub: t("nav.toggle_submenu"),
  };

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Reveal />
        <Header locale={locale} nav={nav} ui={ui} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
