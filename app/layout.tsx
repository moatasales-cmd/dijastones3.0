import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: {
    default: "DIJA Natural Stone — Mediterranean Marble & Natural Stone Atelier",
    template: "%s — DIJA Natural Stone",
  },
  description:
    "Mediterranean marble & natural stone atelier. Family-owned, Izmir-based since 1995.",
};

// Blocking theme init — sets data-theme before first paint so there is
// no flash of the wrong theme (mirrors the old inline <head> script).
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
