import { existsSync } from "node:fs";
import { join } from "node:path";
import { ogScene, ogSize, ogType } from "@/lib/og";
import { categories, categoryById, productsByCategory } from "@/data/catalog";

export const alt = "Раздел каталога Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export function generateStaticParams() {
  return categories.map((c) => ({ cat: c.id }));
}

export default async function Image({ params }: { params: Promise<{ cat: string }> }) {
  const category = categoryById((await params).cat);
  const cover = `/images/categories/${category?.id ?? "beds"}.jpg`;
  const photo = existsSync(join(process.cwd(), "public", cover.slice(1)))
    ? cover
    : "/images/og/catalog.jpg";
  const count = category ? productsByCategory(category.id).length : 0;
  return ogScene({
    photo,
    kicker: count ? `${count} позиций` : "Каталог",
    title: category?.name ?? "Каталог",
  });
}
