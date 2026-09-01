import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { categories, categoryById, productsByCategory, toCardData } from "@/data/catalog";

type Props = { params: Promise<{ cat: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ cat: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryById((await params).cat);
  if (!category) return { title: "Раздел не найден" };
  const count = productsByCategory(category.id).length;
  return {
    title: category.name,
    description: `${category.text} ${count} позиций в наличии и под заказ, серийные партии и изготовление по ТЗ.`,
    alternates: { canonical: `/catalog/${category.id}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = categoryById((await params).cat);
  if (!category) notFound();

  const cards = productsByCategory(category.id).map(toCardData);

  return (
    <main className="wrap" id="content">
      <Suspense fallback={<div className="empty">Загружаем каталог…</div>}>
        <CatalogBrowser products={cards} categories={categories} category={category} />
      </Suspense>
    </main>
  );
}
