import type { MetadataRoute } from "next";
import { getWorkSlugs } from "@/lib/supabase";

const BASE = "https://h-item.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/ranking`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/ranking/daily`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/ranking/weekly`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/ranking/monthly`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/new`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/genres`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/creators`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/free`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/sample`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/price/under-500`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/price/under-1000`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const works = await getWorkSlugs(5000);
    return [
      ...staticPages,
      ...works.map((work) => ({
        url: `${BASE}/work/${work.slug}`,
        lastModified: new Date(work.published_at ?? work.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticPages;
  }
}
