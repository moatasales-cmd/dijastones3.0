"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.ok) window.location.href = "/admin";
    else setError(res.error || "Login failed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-xl p-8 border border-zinc-200"
      >
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">DIJA Admin</h1>
        <p className="text-sm text-zinc-500 mb-6">Sign in to manage the CRM.</p>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        <input
          className="w-full mb-3 px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          className="w-full mb-5 px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-zinc-900 text-white text-sm font-medium py-2.5 rounded hover:bg-zinc-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
