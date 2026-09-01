import type { ProductCardData } from "@/data/catalog";

export type Range = { min: string; max: string };

export const EMPTY_RANGE: Range = { min: "", max: "" };

export type Filters = {
  colors: string[];
  coatings: string[];
  badges: string[];
  gostOnly: boolean;
  price: Range;
  width: Range;
  height: Range;
  depth: Range;
  minLoad: string;
  query: string;
};

export const EMPTY_FILTERS: Filters = {
  colors: [],
  coatings: [],
  badges: [],
  gostOnly: false,
  price: EMPTY_RANGE,
  width: EMPTY_RANGE,
  height: EMPTY_RANGE,
  depth: EMPTY_RANGE,
  minLoad: "",
  query: "",
};

/** Ключ грани каталога. Нужен, чтобы посчитать варианты «как будто эта грань не применена». */
export type Facet =
  | "colors"
  | "coatings"
  | "badges"
  | "gost"
  | "price"
  | "width"
  | "height"
  | "depth"
  | "load"
  | "query";

export function toNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
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

export function searchText(p: ProductCardData) {
  return [
    p.name,
    p.sku,
    p.material,
    p.sizes,
    p.gost,
    p.coating,
    ...(p.colors ?? []),
    ...(p.colorTags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export type SearchIndex = Map<string, string>;

export function buildIndex(products: ProductCardData[]): SearchIndex {
  return new Map(products.map((p) => [p.id, searchText(p)]));
}

/**
 * Внутри одной грани значения складываются по «или» (серый ИЛИ белый),
 * разные грани — по «и». Так работает любой привычный фасетный фильтр.
 *
 * `skip` исключает одну грань из проверки: по такому счёту показываются
 * числа рядом с её же вариантами, иначе выбранный вариант обнулил бы соседей.
 */
export function matches(
  product: ProductCardData,
  filters: Filters,
  index: SearchIndex,
  skip?: Facet,
): boolean {
  if (skip !== "colors" && filters.colors.length) {
    if (!(product.colorTags ?? []).some((c) => filters.colors.includes(c))) return false;
  }
  if (skip !== "coatings" && filters.coatings.length) {
    if (!product.coatingType || !filters.coatings.includes(product.coatingType)) return false;
  }
  if (skip !== "badges" && filters.badges.length) {
    if (!product.badge || !filters.badges.includes(product.badge)) return false;
  }
  if (skip !== "gost" && filters.gostOnly && !product.gost) return false;

  if (skip !== "price" && !inRange(product.price ?? undefined, filters.price)) return false;
  if (skip !== "width" && !inRange(product.width, filters.width)) return false;
  if (skip !== "height" && !inRange(product.height, filters.height)) return false;
  if (skip !== "depth" && !inRange(product.length, filters.depth)) return false;

  if (skip !== "load") {
    const min = toNum(filters.minLoad);
    if (min != null && (product.load == null || product.load < min)) return false;
  }

  if (skip !== "query") {
    const q = filters.query.trim().toLowerCase();
    if (q && !index.get(product.id)?.includes(q)) return false;
  }

  return true;
}

export type Counts = {
  colors: Map<string, number>;
  coatings: Map<string, number>;
  badges: Map<string, number>;
  gost: number;
};

/** Сколько товаров останется, если добавить к текущему набору ещё один вариант. */
export function countFacets(
  products: ProductCardData[],
  filters: Filters,
  index: SearchIndex,
): Counts {
  const colors = new Map<string, number>();
  const coatings = new Map<string, number>();
  const badges = new Map<string, number>();
  let gost = 0;

  const bump = (map: Map<string, number>, key: string | undefined) => {
    if (key) map.set(key, (map.get(key) ?? 0) + 1);
  };

  for (const p of products) {
    if (matches(p, filters, index, "colors")) {
      for (const c of p.colorTags ?? []) bump(colors, c);
    }
    if (matches(p, filters, index, "coatings")) bump(coatings, p.coatingType);
    if (matches(p, filters, index, "badges")) bump(badges, p.badge);
    if (matches(p, filters, index, "gost") && p.gost) gost++;
  }

  return { colors, coatings, badges, gost };
}

export type Bounds = {
  price: [number, number] | null;
  width: [number, number] | null;
  height: [number, number] | null;
  depth: [number, number] | null;
  load: [number, number] | null;
};

/** Границы по набору товаров — подсказываем их в полях «от» и «до». */
export function getBounds(products: ProductCardData[]): Bounds {
  const span = (values: (number | null | undefined)[]): [number, number] | null => {
    const nums = values.filter((v): v is number => v != null);
    if (!nums.length) return null;
    return [Math.floor(Math.min(...nums)), Math.ceil(Math.max(...nums))];
  };
  return {
    price: span(products.map((p) => p.price)),
    width: span(products.map((p) => p.width)),
    height: span(products.map((p) => p.height)),
    depth: span(products.map((p) => p.length)),
    load: span(products.map((p) => p.load)),
  };
}

export type Chip = { key: string; label: string; clear: (f: Filters) => Filters };

const rangeLabel = (name: string, unit: string, range: Range) => {
  if (range.min && range.max) return `${name}: ${range.min}–${range.max} ${unit}`;
  if (range.min) return `${name}: от ${range.min} ${unit}`;
  return `${name}: до ${range.max} ${unit}`;
};

/** Плашки применённых фильтров: видно, что выбрано, и каждое снимается по отдельности. */
export function describeFilters(filters: Filters): Chip[] {
  const chips: Chip[] = [];

  for (const color of filters.colors) {
    chips.push({
      key: `color:${color}`,
      label: color,
      clear: (f) => ({ ...f, colors: f.colors.filter((c) => c !== color) }),
    });
  }
  for (const coating of filters.coatings) {
    chips.push({
      key: `coating:${coating}`,
      label: `Покрытие: ${coating.toLowerCase()}`,
      clear: (f) => ({ ...f, coatings: f.coatings.filter((c) => c !== coating) }),
    });
  }
  for (const badge of filters.badges) {
    chips.push({
      key: `badge:${badge}`,
      label: badge,
      clear: (f) => ({ ...f, badges: f.badges.filter((b) => b !== badge) }),
    });
  }
  if (filters.gostOnly) {
    chips.push({ key: "gost", label: "По ГОСТ", clear: (f) => ({ ...f, gostOnly: false }) });
  }

  const ranges: [keyof Filters & ("price" | "width" | "height" | "depth"), string, string][] = [
    ["price", "Цена", "₽"],
    ["width", "Ширина", "мм"],
    ["height", "Высота", "мм"],
    ["depth", "Длина", "мм"],
  ];
  for (const [key, name, unit] of ranges) {
    const range = filters[key];
    if (range.min || range.max) {
      chips.push({
        key,
        label: rangeLabel(name, unit, range),
        clear: (f) => ({ ...f, [key]: EMPTY_RANGE }),
      });
    }
  }

  if (filters.minLoad) {
    chips.push({
      key: "load",
      label: `Нагрузка от ${filters.minLoad} кг`,
      clear: (f) => ({ ...f, minLoad: "" }),
    });
  }
  if (filters.query.trim()) {
    chips.push({
      key: "query",
      label: `Поиск: ${filters.query.trim()}`,
      clear: (f) => ({ ...f, query: "" }),
    });
  }

  return chips;
}
