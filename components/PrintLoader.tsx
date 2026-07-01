"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export interface PrintLoaderLabels {
  coverTitle: string;
  preparing: string;
  loadingImages: string;
  loadingStatus: string; // "%d of %d images"
  savePdf: string;
  close: string;
  ready: string;
}

const flagUk = (
  <svg viewBox="0 0 60 30" width="24" height="12" style={{ verticalAlign: "middle" }}>
    <rect width="60" height="30" fill="#012169" />
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="4" />
    <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
    <path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
  </svg>
);
const flagFr = (
  <svg viewBox="0 0 60 30" width="24" height="12" style={{ verticalAlign: "middle" }}>
    <rect width="60" height="30" fill="#fff" />
    <rect width="20" height="30" fill="#002395" />
    <rect x="40" width="20" height="30" fill="#ed2939" />
  </svg>
);

export default function PrintLoader({
  labels: L,
  locale,
  imgSelector = ".page img",
}: {
  labels: PrintLoaderLabels;
  locale: Locale;
  imgSelector?: string;
}) {
  const [pct, setPct] = useState(2);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(imgSelector));
    const total = imgs.length;
    let finished = false;

    const setStatusText = (loaded: number) =>
      setStatus(L.loadingStatus.replace("%d", String(loaded)).replace("%d", String(total)));

    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      setStatusText(total);
      setDone(true);
    };

    const check = () => {
      const loaded = imgs.filter((i) => i.complete).length;
      const p = total === 0 ? 100 : Math.round((loaded / total) * 100);
      setPct((cur) => (p > cur ? p : cur));
      setStatusText(loaded);
      if (loaded >= total) {
        finish();
        return true;
      }
      return false;
    };

    imgs.forEach((img) => {
      img.onload = check;
      img.onerror = check;
    });

    if (!check()) {
      const poll = setInterval(() => {
        if (check()) clearInterval(poll);
      }, 200);
      const timeout = setTimeout(finish, 8000);
      return () => {
        clearInterval(poll);
        clearTimeout(timeout);
      };
    }
  }, [L, imgSelector]);

  function switchLang(code: Locale) {
    document.cookie = `lang=${code};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }

  return (
    <>
      <div id="loading-overlay" className={done ? "hidden" : ""}>
        <h2>{L.coverTitle}</h2>
        <p>{L.preparing}</p>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="pct">{pct}%</div>
        <div className="cstatus">{status || L.loadingImages}</div>
      </div>

      <div className={`print-ui${done ? " visible" : ""}`}>
        <div className="lang-dropdown-wrap">
          <button className="lang-dropdown-btn" onClick={() => setLangOpen((v) => !v)}>
            <span className="lang-flag">{locale === "en" ? flagUk : flagFr}</span>
            <span className="lang-arrow">▲</span>
          </button>
          <div className={`lang-dropdown-menu${langOpen ? " open" : ""}`}>
            <a href="#" onClick={(e) => (e.preventDefault(), switchLang("en"))} className={locale === "en" ? "active" : ""}>
              <span className="lang-flag">{flagUk}</span> English
            </a>
            <a href="#" onClick={(e) => (e.preventDefault(), switchLang("fr"))} className={locale === "fr" ? "active" : ""}>
              <span className="lang-flag">{flagFr}</span> Français
            </a>
          </div>
        </div>
        <span className="lang-sep">|</span>
        <button onClick={() => window.print()}>{L.savePdf}</button>
        <button onClick={() => window.close()}>{L.close}</button>
        <span className="ready-text">✓ {L.ready}</span>
      </div>
    </>
  );
}
