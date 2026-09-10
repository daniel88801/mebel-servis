import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { categories, categoryCounts, products, toCardData } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

const cards = products.map(toCardData);

export const metadata = pageMeta({
  title: "Каталог",
  description:
    "Каталог завода в Нижнем Новгороде: армейские кровати, металлические шкафы, мебель на каркасе и ЛДСП для общежитий, школ и гостиниц. Фильтры по размерам и нагрузке.",
  path: "/catalog",
});

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
