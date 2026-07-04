import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { resolveNav } from "@/lib/nav";
import NewsletterForm from "@/components/NewsletterForm";

export default async function Footer() {
  const { t } = await getT();
  const nav = resolveNav(t);

  return (
    <>
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <img
                  src="/assets/images/logo-light.png"
                  alt="DIJA Natural Stone"
                  className="logo-img"
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <p>{t("footer.tagline")}</p>
            </div>

            <div className="footer-nav">
              <span className="footer-label">{t("footer.navigation")}</span>
              {nav.map((item) => (
                <span key={item.label} style={{ display: "contents" }}>
                  <Link href={item.href}>{item.label}</Link>
                  {item.children?.map((c) => (
                    <Link key={c.href} href={c.href}>
                      {c.label}
                    </Link>
                  ))}
                </span>
              ))}
            </div>

            <div className="footer-contact">
              <span className="footer-label">{t("footer.contact")}</span>
              <p>
                10031 Sok. No: 14, AOSB
                <br />
                Çiğli 35620 - İzmir - Türkiye
              </p>
              <p>
                +216 54 795 883
                <br />
                +90 232 556 12 00
              </p>
              <p>contact@dijastones.com</p>
            </div>

            <div className="footer-newsletter">
              <span className="footer-label">{t("footer.newsletter")}</span>
              <p>{t("footer.newsletter_desc")}</p>
              <NewsletterForm
                placeholder={t("footer.email_placeholder")}
                submitLabel={t("footer.subscribe")}
              />
            </div>
          </div>

          <div className="footer-bottom">
            <p>{t("footer.copyright", new Date().getFullYear())}</p>
            <div className="footer-legal">
              <Link href="/privacy">{t("footer.privacy")}</Link>
              <Link href="/terms">{t("footer.terms")}</Link>
              <Link href="/cookies">{t("footer.cookies")}</Link>
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/21627986036"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label={t("footer.whatsapp_aria")}
      >
        <i className="fa-brands fa-whatsapp" />
      </a>
    </>
  );
}
