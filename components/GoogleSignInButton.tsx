"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  clientId,
  orText,
  onCredential,
}: {
  clientId: string;
  orText: string;
  onCredential: (credential: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const init = useCallback(() => {
    if (!window.google?.accounts || !wrapRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        if (res.credential) onCredentialRef.current(res.credential);
      },
    });
    window.google.accounts.id.renderButton(wrapRef.current, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      text: "signin_with",
      size: "large",
    });
  }, [clientId]);

  useEffect(() => {
    if (window.google?.accounts) init();
  }, [init]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={init} />
      <div className="auth-divider">
        <span>{orText}</span>
      </div>
      <div className="google-signin-wrap" ref={wrapRef} />
    </>
  );
}
