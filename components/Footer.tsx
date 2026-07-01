import Link from "next/link";
import { nav } from "@/lib/nav";

export default function Footer() {
  return (
    <>
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <img
                  src="/assets/images/logo-light.png"
                  alt="DIJA Marble"
                  className="logo-img"
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <p>
                Mediterranean marble &amp; natural stone atelier. Family-owned,
                Izmir-based.
              </p>
            </div>

            <div className="footer-nav">
              <span className="footer-label">Navigation</span>
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
              <span className="footer-label">Contact</span>
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
              <span className="footer-label">Newsletter</span>
              <p>Quarterly notes from the atelier. No promotions, ever.</p>
              {/* Wired to the newsletter API in a later phase. */}
              <form className="newsletter-form">
                <input type="email" name="email" placeholder="Email" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 DIJA Marble. Izmir — Tunis.</p>
            <div className="footer-legal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/21654795883"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" />
      </a>
    </>
  );
}
