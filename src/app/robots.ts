import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/inbox", "/account", "/og-fonts/"] },
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
