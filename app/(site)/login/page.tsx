import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getT } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/seo";
import { getCurrentClient } from "@/lib/auth";
import AuthForm, { type AuthStrings } from "@/components/AuthForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return pageMeta({ title: t("title.login"), path: "/login", noIndex: true });
}

export default async function LoginPage() {
  const client = await getCurrentClient();
  if (client) redirect("/account");

  const { t } = await getT();
  const s: AuthStrings = {
    signIn: t("login.sign_in"),
    register: t("login.register"),
    email: t("login.email"),
    password: t("login.password"),
    passwordPh: t("login.password_ph"),
    togglePw: t("login.toggle_pw"),
    useCode: t("login.use_code"),
    name: t("login.name"),
    namePh: t("login.name_ph"),
    createAccount: t("login.create_account"),
    haveAccount: t("login.have_account"),
    verifyText: t("login.verify_text"),
    code: t("login.code"),
    verify: t("login.verify"),
    resend: t("login.resend"),
    useDifferentEmail: t("login.use_different_email"),
    or: t("login.or"),
  };

  return (
    <section className="auth-page auth-page--centered">
      <div className="auth-container">
        <div className="auth-header">
          <div className="hero-label">{t("login.client_access")}</div>
          <h1>{t("login.welcome")}</h1>
          <p>{t("login.welcome_text")}</p>
        </div>
        <AuthForm s={s} googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} />
      </div>
    </section>
  );
}
