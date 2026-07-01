"use client";

export default function SignOutButton({ label }: { label: string }) {
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }
  return (
    <button type="button" className="dash-action-danger" onClick={signOut}>
      <i className="fa-solid fa-right-from-bracket" /> {label}
    </button>
  );
}
