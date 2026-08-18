import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin-login", "/api/admin"],
    },
    sitemap: "https://h-item.net/sitemap.xml",
    host: "https://h-item.net",
  };
}
