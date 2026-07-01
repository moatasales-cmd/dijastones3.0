"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll-reveal — ports the IntersectionObserver logic from the old app.js.
 * Elements with `.reveal` / `.reveal-stagger` start hidden (opacity:0 in CSS)
 * and get `.visible` added when they scroll into view. Re-runs on route
 * change so newly-rendered pages animate in too.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger")
    );

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => {
      // Reveal immediately if already in view on load.
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add("visible");
      else observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
