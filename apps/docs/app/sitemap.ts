import type { MetadataRoute } from "next";
import { HOOKS } from "@/lib/hooks-registry";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/docs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...HOOKS.map(({ slug }) => ({
      url: `${SITE_URL}/docs/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/support`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
