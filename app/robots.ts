import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/account", "/proforma", "/datasheet", "/compare"],
      },
      // Aggressive SEO-scraper bot with no search-traffic value; it only
      // burns server resources.
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
