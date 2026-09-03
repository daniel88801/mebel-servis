import type { MetadataRoute } from "next";
import { categories, products } from "@/data/catalog";
import { productHref } from "@/lib/format";
import { absolute } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    "/",
    "/catalog",
    "/about",
    "/contacts",
    "/delivery",
    "/payment",
    "/wholesale",
    "/privacy",
    "/consent",
    "/oferta",
  ];

  return [
    ...pages.map((path) => ({
      url: absolute(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...categories.map((c) => ({
      url: absolute(`/catalog/${c.id}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absolute(productHref(p.id)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
