import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { categories, categoryCounts, products, toCardData } from "@/data/catalog";

const cards = products.map(toCardData);

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог: армейская мебель, металлические кровати, мебель на металлокаркасе, раскладная ЛДСП, мебель для учащихся, рабочих и общежитий. Фильтры по цене, габаритам, нагрузке и покрытию.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogPage() {
  return (
    <main className="wrap" id="content">
      <Suspense fallback={<div className="empty">Загружаем каталог…</div>}>
        <CatalogBrowser
          products={cards}
          categories={categories}
          categoryCounts={categoryCounts}
          category={null}
        />
      </Suspense>
    </main>
  );
}
