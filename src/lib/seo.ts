import type { Metadata } from "next";
import { absolute } from "./site";

type PageMetaInput = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  absoluteTitle?: boolean;
};

export function pageMeta({
  title,
  description,
  path,
  type = "website",
  robots,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const branded = absoluteTitle ? title : `${title} — Мебель-Сервис`;
  const meta: Metadata = {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    openGraph: {
      title: branded,
      description,
      locale: "ru_RU",
      siteName: "Мебель-Сервис",
      type,
      ...(path ? { url: absolute(path) } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
  if (path) meta.alternates = { canonical: path };
  if (robots) meta.robots = robots;
  return meta;
}
