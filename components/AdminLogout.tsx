"use client";

export default function AdminLogout() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }
  return (
    <button
      onClick={logout}
      className="text-sm text-zinc-400 hover:text-white transition-colors"
    >
      <i className="fa-solid fa-right-from-bracket" /> Sign out
    </button>
  );
}
