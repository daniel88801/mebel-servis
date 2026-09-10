import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { JsonLd } from "@/components/JsonLd";
import {
  categories,
  categoryById,
  categoryCounts,
  company,
  productsByCategory,
  toCardData,
} from "@/data/catalog";
import { productHref } from "@/lib/format";
import { absolute } from "@/lib/site";

type Props = { params: Promise<{ cat: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ cat: c.id }));
}

function categoryMetaDescription(text: string, count: number) {
  return `${text} ${count} позиций, каталог ООО Мебель-Сервис, Нижний Новгород`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryById((await params).cat);
  if (!category) return { title: "Раздел не найден" };
  const count = productsByCategory(category.id).length;
  const title = category.name;
  const description = categoryMetaDescription(category.text, count);
  const url = absolute(`/catalog/${category.id}`);
  return {
    title,
    description,
    alternates: { canonical: `/catalog/${category.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      locale: "ru_RU",
      siteName: company.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = categoryById((await params).cat);
  if (!category) notFound();

  const listed = productsByCategory(category.id);
  const cards = listed.map(toCardData);
  const description = categoryMetaDescription(category.text, listed.length);
  const url = absolute(`/catalog/${category.id}`);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: company.name, url: absolute("/") },
    mainEntity: {
      "@type": "ItemList",
      name: category.name,
      numberOfItems: listed.length,
      itemListElement: listed.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(productHref(p.id)),
        name: p.name,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absolute("/") },
      { "@type": "ListItem", position: 2, name: "Каталог", item: absolute("/catalog") },
      { "@type": "ListItem", position: 3, name: category.name, item: url },
    ],
  };

  return (
    <main className="wrap" id="content">
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Suspense fallback={<div className="empty">Загружаем каталог…</div>}>
        <CatalogBrowser
          products={cards}
          categories={categories}
          categoryCounts={categoryCounts}
          category={category}
        />
      </Suspense>
    </main>
  );
}
