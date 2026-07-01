import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getT } from "@/lib/i18n-server";
import { resolveNav } from "@/lib/nav";
import { getCurrentClient } from "@/lib/auth";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { t, locale } = await getT();
  const nav = resolveNav(t);
  const client = await getCurrentClient();
  const ui = {
    signIn: t("nav.sign_in"),
    light: t("theme.light"),
    dark: t("theme.dark"),
    menu: t("mobile.menu"),
    close: t("mobile.close"),
    toggleSub: t("nav.toggle_submenu"),
    loggedIn: !!client,
    accountLabel: client
      ? locale === "fr"
        ? "Mon compte"
        : "My Account"
      : t("nav.sign_in"),
    accountHref: client ? "/account" : "/login",
  };

  return (
    <>
      <Reveal />
      <Header locale={locale} nav={nav} ui={ui} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
