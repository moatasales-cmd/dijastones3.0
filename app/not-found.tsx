import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="hero-label" style={{ color: "var(--accent)", letterSpacing: "0.2em" }}>
        404
      </div>
      <h1 style={{ margin: "0.5rem 0 1rem" }}>{t("error.page_not_found")}</h1>
      <Link href="/" className="btn btn-primary">
        {t("error.back_to_home")}{" "}
        <span className="btn-icon-wrap">
          <i className="fa-solid fa-arrow-right" />
        </span>
      </Link>
    </main>
  );
}
