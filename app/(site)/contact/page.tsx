import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/lang";
import ContactForm from "@/components/ContactForm";
import ContactMap, { type MapMarker } from "@/components/ContactMap";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("title.contact") };
}

const FLAGS: Record<string, string> = {
  tr: "🇹🇷", tn: "🇹🇳", qa: "🇶🇦", it: "🇮🇹", ca: "🇨🇦",
  in: "🇮🇳", br: "🇧🇷", sa: "🇸🇦", us: "🇺🇸",
};
const ROLE_CLASS: Record<string, string> = {
  Headquarters: "hq",
  "Factory & Atelier": "factory",
  "Regional Office": "regional",
  "Gulf Office": "gulf",
  "European Office": "europe",
  "North America Office": "north",
};

const tel = (p: string) => p.replace(/[^+\d]/g, "");
const flag = (f?: string | null) => FLAGS[(f || "").toLowerCase()] || "";

export default async function ContactPage() {
  const { t } = await getT();
  const all = await prisma.office.findMany();
  const offices = all.filter((o) => o.type === "office");
  const partners = all.filter((o) => o.type === "partner");

  const markers: MapMarker[] = all
    .filter((o) => o.lat != null && o.lng != null)
    .map((o) => ({
      lat: o.lat!,
      lng: o.lng!,
      title: `${o.city}, ${o.country}`,
      role: o.role ?? "",
      phone: (Array.isArray(o.phone) ? (o.phone as string[])[0] : "") ?? "",
      email: o.email ?? "",
      type: o.type ?? "",
    }));

  const phones = (o: (typeof all)[number]) =>
    Array.isArray(o.phone) ? (o.phone as string[]) : [];
  const services = (o: (typeof all)[number]) =>
    Array.isArray(o.services) ? (o.services as string[]) : [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="hero-label">{t("contact.hero_label")}</div>
          <h1 className="hero-title" {...rich(t("contact.hero_title"))} />
          <p>{t("contact.hero_text")}</p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="quick-contact stagger-fade">
            <a href="tel:+902325561200" className="quick-contact-item">
              <i className="fa-solid fa-phone" /> +90 232 556 12 00
            </a>
            <span className="quick-contact-divider" />
            <a href="https://wa.me/21627986036" target="_blank" rel="noopener noreferrer" className="quick-contact-item wa">
              <i className="fa-brands fa-whatsapp" /> WhatsApp
            </a>
            <span className="quick-contact-divider" />
            <a href="mailto:info@dijastones.com" className="quick-contact-item">
              <i className="fa-solid fa-envelope" /> info@dijastones.com
            </a>
            <span className="quick-contact-divider" />
            <span className="quick-contact-item" style={{ cursor: "default" }}>
              <i className="fa-regular fa-clock" /> {t("contact.hours")}
            </span>
          </div>

          <span className="section-label stagger-fade">
            <i className="fa-solid fa-building" /> {t("contact.offices_label")}
          </span>
          <div className="offices-grid">
            {offices.map((o) => (
              <div className="office-card stagger-fade" key={o.id}>
                <div className="office-hdr">
                  <h3>
                    {o.city}, {o.country}
                  </h3>
                  <span className="office-flag">{flag(o.flag)}</span>
                </div>
                <div className={`office-role ${ROLE_CLASS[o.role ?? ""] ?? ""}`}>
                  {o.role}
                </div>
                <div className="office-detail">
                  <i className="fa-solid fa-location-dot" />
                  <span>
                    {o.address},<br />
                    {o.address2}
                  </span>
                </div>
                {phones(o).map((ph) => (
                  <div className="office-detail" key={ph}>
                    <i className="fa-solid fa-phone" />
                    <a href={`tel:${tel(ph)}`}>{ph}</a>
                  </div>
                ))}
                <div className="office-detail">
                  <i className="fa-solid fa-envelope" />
                  <a href={`mailto:${o.email}`}>{o.email}</a>
                </div>
                <div className="office-hours">
                  <i className="fa-regular fa-clock" /> {o.hours}
                </div>
              </div>
            ))}
          </div>

          <span className="section-label stagger-fade">
            <i className="fa-solid fa-handshake" /> {t("contact.partners_label")}
          </span>
          <div className="partners-grid">
            {partners.map((p) => (
              <div className="partner-card stagger-fade" key={p.id}>
                <div className="partner-hdr">
                  <h3>
                    {p.city}, {p.country}
                  </h3>
                  <span className="office-flag">{flag(p.flag)}</span>
                </div>
                <div className="partner-company">{p.partnerCompany}</div>
                <div className="partner-contact">
                  <i className="fa-solid fa-user" /> {p.contactPerson}
                </div>
                <div className="office-detail">
                  <i className="fa-solid fa-location-dot" />
                  <span>
                    {p.address}, {p.address2}
                  </span>
                </div>
                {phones(p).map((ph) => (
                  <div className="partner-detail" key={ph}>
                    <i className="fa-solid fa-phone" />
                    <a href={`tel:${tel(ph)}`}>{ph}</a>
                  </div>
                ))}
                <div className="partner-detail">
                  <i className="fa-solid fa-envelope" />
                  <a href={`mailto:${p.email}`}>{p.email}</a>
                </div>
                <div className="partner-tags">
                  {services(p).map((sv) => (
                    <span className="partner-tag" key={sv}>
                      {sv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <span className="section-label stagger-fade">
            <i className="fa-solid fa-map" /> {t("contact.map_label")}
          </span>
          <div className="contact-map-wrap stagger-fade">
            <ContactMap markers={markers} />
          </div>

          <div className="contact-grid">
            <ContactForm
              offices={offices.map((o) => ({
                value: o.id,
                label: `${o.city}, ${o.country} (${o.role})`,
              }))}
              partners={partners.map((p) => ({
                value: p.id,
                label: `${p.city}, ${p.country} — ${p.partnerCompany ?? ""}`,
              }))}
              labels={{
                name: t("contact.form_name"),
                email: t("contact.form_email"),
                phone: t("contact.form_phone"),
                company: t("contact.form_company"),
                message: t("contact.form_message"),
                submit: t("contact.form_submit"),
                sending: t("contact.form_submit"),
                selectOffice: t("contact.select_office"),
                officesLabel: t("contact.offices_label"),
                partnersLabel: t("contact.partners_label"),
                success: t("contact.form_success", "Thank you — we'll be in touch shortly."),
                error: t("contact.form_error", "Something went wrong. Please try again."),
              }}
            />
            <div>
              <div className="info-card">
                <div className="card-meta">
                  <i className="fa-solid fa-crown" /> Istanbul{" "}
                  <span style={{ color: "var(--accent)" }}>· {t("contact.hq_label")}</span>
                </div>
                <p>
                  Büyükdere Cad. No: 237, Levent
                  <br />
                  34330 Beşiktaş, İstanbul, Türkiye
                </p>
                <p>+90 212 444 34 52</p>
                <div className="card-meta" style={{ marginTop: "1.5rem" }}>
                  <i className="fa-solid fa-industry" /> Izmir{" "}
                  <span style={{ color: "var(--accent)" }}>· {t("contact.factory_label")}</span>
                </div>
                <p>
                  10031 Sok. No: 14, AOSB
                  <br />
                  35620 Çiğli, İzmir, Türkiye
                </p>
                <p>+90 232 556 12 00</p>
                <div className="card-meta" style={{ marginTop: "1.5rem" }}>
                  {t("contact.email_label")}
                </div>
                <p>info@dijastones.com</p>
                <div className="card-meta" style={{ marginTop: "1rem" }}>
                  {t("contact.response_label")}
                </div>
                <p>
                  <i className="fa-regular fa-clock" style={{ color: "var(--accent)" }} />{" "}
                  {t("contact.response_text")}
                </p>
              </div>
              <div className="contact-social">
                <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
                <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
                <a href="#" aria-label="Pinterest"><i className="fa-brands fa-pinterest-p" /></a>
                <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
                <a href="#" aria-label="Houzz"><i className="fa-brands fa-houzz" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
