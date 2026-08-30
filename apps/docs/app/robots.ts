import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The llms.txt files are explicitly surfaced (already covered by "/", but
    // listing them advertises the AI-friendly index and full dump to crawlers).
    rules: { userAgent: "*", allow: ["/", "/llms.txt", "/llms-full.txt"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
