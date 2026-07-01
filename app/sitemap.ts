import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES = [
  "", "materials", "collections", "projects", "journal", "quarries",
  "heritage", "sustainability", "contact", "trade", "login", "catalogue",
  "privacy", "terms", "cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stones, collections, projects, posts] = await Promise.all([
    prisma.stone.findMany({ select: { id: true, updatedAt: true } }),
    prisma.collection.findMany({ select: { id: true } }),
    prisma.project.findMany({ select: { id: true } }),
    prisma.post.findMany({ select: { id: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}/${p}`.replace(/\/$/, "") || SITE_URL,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const stoneEntries: MetadataRoute.Sitemap = stones.map((s) => ({
    url: `${SITE_URL}/materials/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/journal/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticEntries, ...stoneEntries, ...collectionEntries, ...projectEntries, ...postEntries];
}
