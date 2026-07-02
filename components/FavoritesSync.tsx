"use client";

import { useEffect } from "react";

/**
 * When a signed-in user opens their dashboard, the account's favorites are
 * the source of truth. Mirror them into localStorage so heart icons across
 * the whole site (and other tabs) match the account — fixes the mismatch
 * when signing in on a new device.
 */
export default function FavoritesSync({ serverIds }: { serverIds: string[] }) {
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem("dija_favorites") || "[]");
      const same =
        Array.isArray(local) &&
        local.length === serverIds.length &&
        serverIds.every((id) => local.includes(id));
      if (!same) {
        localStorage.setItem("dija_favorites", JSON.stringify(serverIds));
        window.dispatchEvent(new Event("dija-fav-change"));
      }
    } catch {}
  }, [serverIds]);
  return null;
}
