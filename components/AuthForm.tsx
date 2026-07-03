"use client";

import { useState } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export interface AuthStrings {
  signIn: string;
  register: string;
  email: string;
  password: string;
  passwordPh: string;
  togglePw: string;
  useCode: string;
  name: string;
  namePh: string;
  createAccount: string;
  haveAccount: string;
  verifyText: string;
  code: string;
  verify: string;
  resend: string;
  useDifferentEmail: string;
  or: string;
}

const KEY = "dija_favorites";
function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function AuthForm({ s, googleClientId }: { s: AuthStrings; googleClientId?: string }) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const post = (url: string, data: unknown) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json());

  async function afterAuth() {
    // Sync any guest favorites into the account, then land on the dashboard.
    const favs = readFavs();
    if (favs.length) await post("/api/favorites", { merge: favs }).catch(() => {});
    window.location.href = "/account";
  }

  async function onSignIn() {
    setBusy(true);
    setMsg(null);
    const res = await post("/api/auth/login", { email, password });
    setBusy(false);
    if (res.ok) return afterAuth();
    if (res.needs_verification) {
      setStep(2);
      setMsg({ text: res.error, ok: false });
      return;
    }
    setMsg({ text: res.error || "Sign-in failed", ok: false });
  }

  async function onRegister() {
    setBusy(true);
    setMsg(null);
    const res = await post("/api/auth/register", { name, email, password });
    setBusy(false);
    if (res.ok) {
      setStep(2);
      setMsg({ text: res.message, ok: true });
    } else {
      setMsg({ text: res.error || "Registration failed", ok: false });
    }
  }

  async function onGoogleCredential(credential: string) {
    setBusy(true);
    setMsg(null);
    const res = await post("/api/auth/google", { credential });
    setBusy(false);
    if (res.ok) return afterAuth();
    setMsg({ text: res.error || "Google sign-in failed", ok: false });
  }

  async function onUseCode() {
    if (!email) {
      setMsg({ text: "Enter your email first.", ok: false });
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await post("/api/auth/send-code", { email, code_only: true });
    setBusy(false);
    if (res.ok) {
      setStep(2);
      setMsg({ text: res.message, ok: true });
    } else {
      setMsg({ text: res.error, ok: false });
    }
  }

  async function onVerify() {
    setBusy(true);
    setMsg(null);
    const res = await post("/api/auth/verify", { email, code });
    setBusy(false);
    if (res.ok) return afterAuth();
    setMsg({ text: res.error || "Verification failed", ok: false });
  }

  return (
    <div className="auth-card">
      {step === 1 && (
        <>
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === "signin" ? " active" : ""}`}
              onClick={() => (setMode("signin"), setMsg(null))}
            >
              {s.signIn}
            </button>
            <button
              className={`auth-tab${mode === "register" ? " active" : ""}`}
              onClick={() => (setMode("register"), setMsg(null))}
            >
              {s.register}
            </button>
          </div>

          {mode === "signin" ? (
            <div className="auth-form-panel">
              <div className="auth-field">
                <label className="auth-label">{s.email}</label>
                <input
                  type="email"
                  className="pf-input"
                  placeholder={s.email}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-field auth-pw-wrap">
                <label className="auth-label">{s.password}</label>
                <div className="auth-pw-input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    className="pf-input"
                    placeholder={s.password}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSignIn()}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    aria-label={s.togglePw}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    <i className={`fa-regular ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>
              <button
                className="pf-btn pf-btn-primary pf-btn-block"
                disabled={busy}
                onClick={onSignIn}
              >
                {s.signIn}
              </button>
              <p className="auth-footer-text">
                <a href="#" className="auth-link" onClick={(e) => (e.preventDefault(), onUseCode())}>
                  <i className="fa-regular fa-envelope" /> {s.useCode}
                </a>
              </p>
            </div>
          ) : (
            <div className="auth-form-panel">
              <div className="auth-field">
                <label className="auth-label">{s.name}</label>
                <input
                  type="text"
                  className="pf-input"
                  placeholder={s.namePh}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">{s.email}</label>
                <input
                  type="email"
                  className="pf-input"
                  placeholder={s.email}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-field auth-pw-wrap">
                <label className="auth-label">{s.password}</label>
                <div className="auth-pw-input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    className="pf-input"
                    placeholder={s.passwordPh}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onRegister()}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    aria-label={s.togglePw}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    <i className={`fa-regular ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>
              <button
                className="pf-btn pf-btn-primary pf-btn-block"
                disabled={busy}
                onClick={onRegister}
              >
                {s.createAccount}
              </button>
              <p className="auth-footer-text">
                {s.haveAccount}{" "}
                <a href="#" className="auth-link" onClick={(e) => (e.preventDefault(), setMode("signin"))}>
                  {s.signIn}
                </a>
              </p>
            </div>
          )}

          {googleClientId && (
            <GoogleSignInButton
              clientId={googleClientId}
              orText={s.or}
              onCredential={onGoogleCredential}
            />
          )}
        </>
      )}

      {step === 2 && (
        <div>
          <div className="auth-verify-icon">
            <i className="fa-regular fa-envelope-open" />
          </div>
          <p className="auth-verify-text">
            {s.verifyText} <strong>{email}</strong>
          </p>
          <div className="auth-field">
            <label className="auth-label">{s.code}</label>
            <input
              type="text"
              className="pf-input auth-code-input"
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && onVerify()}
            />
          </div>
          <button
            className="pf-btn pf-btn-primary pf-btn-block"
            disabled={busy}
            onClick={onVerify}
          >
            {s.verify}
          </button>
          <div className="auth-resend-wrap">
            <a href="#" className="auth-link" onClick={(e) => (e.preventDefault(), onUseCode())}>
              {s.resend}
            </a>
          </div>
          <p className="auth-footer-text">
            <a
              href="#"
              className="auth-link"
              onClick={(e) => (e.preventDefault(), setStep(1), setCode(""), setMsg(null))}
            >
              <i className="fa-regular fa-arrow-left" /> {s.useDifferentEmail}
            </a>
          </p>
        </div>
      )}

      {msg && (
        <div
          className="auth-msg"
          style={{ color: msg.ok ? "var(--accent)" : "#c0392b", marginTop: "1rem" }}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
