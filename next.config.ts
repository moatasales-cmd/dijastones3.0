import type { NextConfig } from "next";

// Baseline security headers. CSP is intentionally omitted for now — the site
// loads Google Fonts, Leaflet (unpkg), OpenStreetMap tiles, and Google
// Sign-In, so a strict CSP needs its own carefully-tested allowlist pass.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
