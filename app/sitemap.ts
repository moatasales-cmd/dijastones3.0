import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { locales, defaultLocale } from "@/lib/i18n";

const STATIC_PAGES = [
  "", "materials", "collections", "projects", "journal", "quarries",
  "heritage", "sustainability", "contact", "trade", "login", "catalogue",
  "case-studies", "privacy", "terms", "cookies",
];

type Entry = Omit<MetadataRoute.Sitemap[number], "url"> & { path: string };

// One sitemap entry per locale variant: "/materials" also exists as
// "/fr/materials", "/ar/materials", ... (served by middleware.ts). This is
// how crawlers discover the localized pages — internal links stay unprefixed.
function localized(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.flatMap(({ path, ...rest }) =>
    locales.map((l) => ({
      url: `${SITE_URL}${l === defaultLocale ? "" : `/${l}`}${path}` || SITE_URL,
      ...rest,
    }))
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stones, collections, projects, posts, caseStudies] = await Promise.all([
    prisma.stone.findMany({ select: { id: true, updatedAt: true } }),
    prisma.collection.findMany({ select: { id: true } }),
    prisma.project.findMany({ select: { id: true } }),
    prisma.post.findMany({ select: { id: true } }),
    prisma.caseStudy.findMany({ select: { id: true } }),
  ]);

  const staticEntries: Entry[] = STATIC_PAGES.map((p) => ({
    path: p ? `/${p}` : "",
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const stoneEntries: Entry[] = stones.map((s) => ({
    path: `/materials/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const collectionEntries: Entry[] = collections.map((c) => ({
    path: `/collections/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectEntries: Entry[] = projects.map((p) => ({
    path: `/projects/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const postEntries: Entry[] = posts.map((p) => ({
    path: `/journal/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const caseStudyEntries: Entry[] = caseStudies.map((c) => ({
    path: `/case-studies/${c.id}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return localized([
    ...staticEntries,
    ...stoneEntries,
    ...collectionEntries,
    ...projectEntries,
    ...postEntries,
    ...caseStudyEntries,
  ]);
}
