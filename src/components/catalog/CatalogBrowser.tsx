"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard } from "../ProductCard";
import { FilterPanel } from "./FilterPanel";
import { Pager } from "./Pager";
import {
  EMPTY_FILTERS,
  buildIndex,
  countFacets,
  describeFilters,
  getBounds,
  matches,
  type Filters,
} from "./filters";
import type { Category, ProductCardData } from "@/data/catalog";

type Sort = "default" | "price-asc" | "price-desc" | "name";

const SORT_LABELS: Record<Sort, string> = {
  default: "По каталогу",
  "price-asc": "Сначала дешевле",
  "price-desc": "Сначала дороже",
  name: "По названию",
};

const PER_PAGE = 24;

function plural(n: number, one: string, few: string, many: string) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 14) return many;
  const last = n % 10;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export function CatalogBrowser({
  products,
  categories,
  categoryCounts,
  category,
  initialQuery = "",
}: {
  products: ProductCardData[];
  categories: Category[];
  /** Счётчики по всему каталогу, чтобы список разделов показывал объём каждого. */
  categoryCounts: Record<string, number>;
  category: Category | null;
  initialQuery?: string;
}) {
  const [filters, setFiltersState] = useState<Filters>({ ...EMPTY_FILTERS, query: initialQuery });
  const [sort, setSort] = useState<Sort>("default");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const gridTop = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(products), [products]);
  const bounds = useMemo(() => getBounds(products), [products]);
  const counts = useMemo(() => countFacets(products, filters, index), [products, filters, index]);

  const options = useMemo(
    () => ({
      colors: [...new Set(products.flatMap((p) => p.colorTags ?? []))],
      coatings: [...new Set(products.map((p) => p.coatingType).filter(Boolean) as string[])],
      badges: [...new Set(products.map((p) => p.badge).filter(Boolean) as string[])],
    }),
    [products],
  );

  const list = useMemo(() => {
    const out = products.filter((p) => matches(p, filters, index));
    if (sort === "price-asc") out.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "price-desc") out.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return out;
  }, [products, filters, index, sort]);

  // Смена фильтров всегда возвращает на первую страницу.
  const setFilters = useCallback((update: (f: Filters) => Filters) => {
    setFiltersState(update);
    setPage(1);
  }, []);

  const chips = describeFilters(filters);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function goToPage(next: number) {
    setPage(next);
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const panel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      counts={counts}
      bounds={bounds}
      options={options}
      categories={categories}
      categoryCounts={new Map(Object.entries(categoryCounts))}
      activeCategory={category}
    />
  );

  return (
    <>
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link>
          {category ? (
            <>
              {" / "}
              <Link href="/catalog">Каталог</Link> / {category.name}
            </>
          ) : (
            " / Каталог"
          )}
        </p>
        <h1>{category ? category.name : "Каталог"}</h1>
        <p style={{ maxWidth: "60ch", marginTop: 10, color: "var(--ink-2)" }}>
          {category
            ? category.text
            : "Полный каталог: фильтры по цене, габаритам, нагрузке, покрытию и ГОСТ. Серийные партии и изготовление по ТЗ."}
        </p>
      </div>

      <div className="catalog-layout">
        <aside className="filters-col">{panel}</aside>

        <div ref={gridTop}>
          <div className="toolbar">
            <input
              className="search"
              type="search"
              placeholder="Название, артикул или ГОСТ"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              aria-label="Поиск по каталогу"
            />
            <button
              type="button"
              className="btn btn-ghost filters-toggle"
              onClick={() => setDrawerOpen(true)}
            >
              Фильтры{chips.length ? ` · ${chips.length}` : ""}
            </button>
            <label className="sort-field">
              <span>Сортировка</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="applied">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="applied-chip"
                  onClick={() => setFilters(chip.clear)}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">— снять фильтр</span>
                </button>
              ))}
              <button
                type="button"
                className="flink"
                onClick={() => setFilters(() => ({ ...EMPTY_FILTERS }))}
              >
                Сбросить всё
              </button>
            </div>
          )}

          <p className="result-count">
            {list.length === 0 ? (
              "Ничего не найдено"
            ) : (
              <>
                <b>{list.length}</b> {plural(list.length, "позиция", "позиции", "позиций")}
                {pages > 1 && (
                  <span className="note">
                    {" "}
                    · страница {current} из {pages}
                  </span>
                )}
              </>
            )}
          </p>

          {shown.length ? (
            <div className="grid-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Под эти условия ничего нет</h3>
              <p>
                Снимите часть фильтров или напишите нам — подберём позицию под задачу и изготовим по
                вашему ТЗ.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setFilters(() => ({ ...EMPTY_FILTERS }))}
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          <Pager current={current} total={pages} onChange={goToPage} />
        </div>
      </div>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div
            className="drawer"
            role="dialog"
            aria-label="Фильтры каталога"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="drawer-head">
              <h2>Фильтры</h2>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть фильтры"
              >
                ×
              </button>
            </header>
            <div className="drawer-body">{panel}</div>
            <footer className="drawer-foot">
              {chips.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setFilters(() => ({ ...EMPTY_FILTERS }))}
                >
                  Сбросить
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDrawerOpen(false)}
              >
                Показать {list.length}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
