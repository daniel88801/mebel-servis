"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { searchText, type Category, type ProductCardData } from "@/data/catalog";

type Sort = "default" | "price-asc" | "price-desc" | "name";

type Range = { min: string; max: string };

const EMPTY_RANGE: Range = { min: "", max: "" };
const PER_PAGE = 24;

function toNum(v: string): number | null {
  return v.trim() === "" ? null : Number(v);
}

/** Позиция без размера проходит фильтр, только пока диапазон не задан. */
function inRange(value: number | undefined, range: Range) {
  const min = toNum(range.min);
  const max = toNum(range.max);
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

export function CatalogBrowser({
  products,
  categories,
  category,
}: {
  products: ProductCardData[];
  categories: Category[];
  /** null — страница всего каталога, иначе раздел, чьи товары уже отобраны на сервере. */
  category: Category | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [color, setColor] = useState("");
  const [badge, setBadge] = useState("");
  const [coating, setCoating] = useState("");
  const [gostOnly, setGostOnly] = useState(false);
  const [price, setPrice] = useState(EMPTY_RANGE);
  const [width, setWidth] = useState(EMPTY_RANGE);
  const [height, setHeight] = useState(EMPTY_RANGE);
  const [depth, setDepth] = useState(EMPTY_RANGE);
  const [load, setLoad] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("default");
  const [page, setPage] = useState(1);

  // Индекс строим один раз на набор товаров, а не на каждое нажатие клавиши.
  const index = useMemo(() => new Map(products.map((p) => [p.id, searchText(p)])), [products]);

  const options = useMemo(
    () => ({
      colors: [...new Set(products.flatMap((p) => p.colors ?? []))].sort(),
      badges: [...new Set(products.map((p) => p.badge).filter(Boolean) as string[])],
      coatings: [...new Set(products.map((p) => p.coatingType).filter(Boolean) as string[])].sort(),
      hasGost: products.some((p) => p.gost),
      hasLoad: products.some((p) => p.load),
    }),
    [products],
  );

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    const minLoad = toNum(load);
    let out = [...products];
    if (color) out = out.filter((p) => (p.colors ?? []).includes(color));
    if (badge) out = out.filter((p) => p.badge === badge);
    if (coating) out = out.filter((p) => p.coatingType === coating);
    if (gostOnly) out = out.filter((p) => p.gost);
    if (minLoad != null) out = out.filter((p) => p.load != null && p.load >= minLoad);
    out = out.filter(
      (p) =>
        inRange(p.price ?? undefined, price) &&
        inRange(p.width, width) &&
        inRange(p.height, height) &&
        inRange(p.length, depth),
    );
    if (q) out = out.filter((p) => index.get(p.id)?.includes(q));
    if (sort === "price-asc") out.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "price-desc") out.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return out;
  }, [
    products,
    index,
    color,
    badge,
    coating,
    gostOnly,
    load,
    price,
    width,
    height,
    depth,
    query,
    sort,
  ]);

  // Любая смена фильтра возвращает на первую страницу — сверяем состав фильтров при рендере.
  const filterKey = JSON.stringify([
    color,
    badge,
    coating,
    gostOnly,
    load,
    price,
    width,
    height,
    depth,
    query,
    sort,
  ]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function reset() {
    setColor("");
    setBadge("");
    setCoating("");
    setGostOnly(false);
    setPrice(EMPTY_RANGE);
    setWidth(EMPTY_RANGE);
    setHeight(EMPTY_RANGE);
    setDepth(EMPTY_RANGE);
    setLoad("");
    setQuery("");
    setSort("default");
  }

  const rangeInputs = (label: string, value: Range, set: (r: Range) => void) => (
    <>
      <h4>{label}</h4>
      <div className="filter-row">
        <input
          type="number"
          min="0"
          placeholder="от"
          value={value.min}
          onChange={(e) => set({ ...value, min: e.target.value })}
        />
        <input
          type="number"
          min="0"
          placeholder="до"
          value={value.max}
          onChange={(e) => set({ ...value, max: e.target.value })}
        />
      </div>
    </>
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
            : "Полный каталог: фильтры по разделу, цвету, цене, размерам, покрытию и нагрузке. Серийные партии и изготовление по ТЗ."}
        </p>
      </div>

      <div className="catalog-layout">
        <aside className="filters">
          <h4>Раздел</h4>
          <select
            value={category?.id ?? "all"}
            onChange={(e) =>
              router.push(e.target.value === "all" ? "/catalog" : `/catalog/${e.target.value}`)
            }
          >
            <option value="all">Все разделы</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {options.colors.length > 1 && (
            <>
              <h4>Цвет</h4>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="">Все цвета</option>
                {options.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}

          {rangeInputs("Цена, ₽", price, setPrice)}
          {rangeInputs("Ширина, мм", width, setWidth)}
          {rangeInputs("Высота, мм", height, setHeight)}
          {rangeInputs("Длина / глубина, мм", depth, setDepth)}

          {options.hasLoad && (
            <>
              <h4>Нагрузка от, кг</h4>
              <input
                type="number"
                min="0"
                placeholder="например, 180"
                value={load}
                onChange={(e) => setLoad(e.target.value)}
              />
            </>
          )}

          {options.coatings.length > 1 && (
            <>
              <h4>Покрытие</h4>
              <select value={coating} onChange={(e) => setCoating(e.target.value)}>
                <option value="">Любое</option>
                {options.coatings.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}

          {options.badges.length > 0 && (
            <>
              <h4>Метка</h4>
              <select value={badge} onChange={(e) => setBadge(e.target.value)}>
                <option value="">Все</option>
                {options.badges.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </>
          )}

          {options.hasGost && (
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={gostOnly}
                onChange={(e) => setGostOnly(e.target.checked)}
              />
              Только изготовленные по ГОСТ
            </label>
          )}

          <button
            className="btn btn-ghost btn-sm"
            type="button"
            style={{ width: "100%", marginTop: 16 }}
            onClick={reset}
          >
            Сбросить фильтры
          </button>
        </aside>

        <div>
          <div className="toolbar">
            <input
              className="search"
              type="search"
              placeholder="Поиск по названию, артикулу или ГОСТ"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="default">По каталогу</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="name">По названию</option>
            </select>
          </div>

          <p className="note" style={{ margin: "8px 0 14px" }}>
            {list.length === 0
              ? "Ничего не найдено"
              : `Найдено: ${list.length}${pages > 1 ? ` · страница ${current} из ${pages}` : ""}`}
          </p>

          <div className="grid-4">
            {shown.length ? (
              shown.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="empty">Ничего не найдено. Измените фильтры.</div>
            )}
          </div>

          {pages > 1 && (
            <nav className="pager" aria-label="Страницы каталога">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Назад
              </button>
              <span className="mono pager-state">
                {current} / {pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Вперёд
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
