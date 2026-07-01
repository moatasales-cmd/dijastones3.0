"use client";

import { useEffect, useRef } from "react";

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  role: string;
  phone: string;
  email: string;
  type: string;
}

// Load Leaflet from CDN once (mirrors the old contact page).
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.setAttribute("data-leaflet", "1");
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-leaflet]");
    if (existing) {
      existing.addEventListener("load", () => resolve(w.L));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.setAttribute("data-leaflet", "1");
    script.onload = () => resolve(w.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function ContactMap({ markers }: { markers: MapMarker[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current || !ref.current) return;
    inited.current = true;
    let map: any;
    loadLeaflet().then((L) => {
      if (!ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([30, 20], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);
      const bounds: [number, number][] = [];
      markers.forEach((m) => {
        const color = m.type === "office" ? "#1e4d7b" : "#0d9488";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background:${color};width:14px;height:14px;border-radius:${
            m.type === "office" ? "50%" : "2px"
          };border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${m.title}</strong><br><span class="popup-role">${m.role}</span>` +
              (m.phone ? `<br><span class="popup-phone">${m.phone}</span>` : "") +
              (m.email ? `<br><a href="mailto:${m.email}" style="color:#1e4d7b">${m.email}</a>` : "")
          );
        bounds.push([m.lat, m.lng]);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    });
    return () => {
      if (map) map.remove();
    };
  }, [markers]);

  return <div ref={ref} className="contact-map" />;
}
