"use client";

// Root error boundary — shown for unexpected runtime errors.
// Client component (Next.js requirement), so text is bilingual via a
// minimal inline check of the lang cookie rather than the server translator.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const fr =
    typeof document !== "undefined" && document.cookie.includes("lang=fr");
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
        {fr ? "Erreur" : "Error"}
      </div>
      <h1 style={{ margin: "0.5rem 0 1rem" }}>
        {fr ? "Un problème est survenu." : "Something went wrong."}
      </h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
        {fr
          ? "Réessayez, ou revenez à l'accueil."
          : "Please try again, or return to the home page."}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          {fr ? "Réessayer" : "Try again"}
        </button>
        <a href="/" className="btn btn-ghost" style={{ color: "var(--text)" }}>
          {fr ? "Accueil" : "Home"}
        </a>
      </div>
      {error?.digest && (
        <p style={{ marginTop: "2rem", fontSize: "0.75rem", opacity: 0.4 }}>
          Ref: {error.digest}
        </p>
      )}
    </main>
  );
}
