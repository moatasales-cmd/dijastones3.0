import type { Metadata } from "next";
import "./globals.css";
import { getT } from "@/lib/i18n-server";
import { SITE_URL } from "@/lib/site";
import { organizationLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title.home"),
      template: `%s — ${t("title.suffix")}`,
    },
    description: t("meta.description"),
    openGraph: {
      siteName: "DIJA Natural Stone",
      type: "website",
      title: t("title.home"),
      description: t("meta.description"),
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title.home"),
      description: t("meta.description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

// Blocking theme init — sets data-theme before first paint so there is
// no flash of the wrong theme (mirrors the old inline <head> script).
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { t, locale } = await getT();
  const dir = t("lang.dir") === "rtl" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        {children}
      </body>
    </html>
  );
}
