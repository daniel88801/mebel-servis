import data from "./catalog.json";

export type Company = {
  name: string;
  legal: string;
  city: string;
  address: string;
  phones: string[];
  email: string;
  hours: string;
  inn: string;
  kpp: string;
  ogrn: string;
  rs: string;
  bank: string;
  ks: string;
  bik: string;
};

export type Category = {
  id: string;
  name: string;
  short: string;
  image: string;
  text: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number | null;
  image: string;
  sizes?: string;
  material?: string;
  desc?: string;
  colors?: string[];
  length?: number;
  width?: number;
  height?: number;
  badge?: string;
  /* Поля ниже разбирает scripts/enrich-catalog.mjs из текста `desc`. */
  weight?: number;
  volume?: number;
  load?: number;
  coating?: string;
  coatingType?: string;
  warranty?: string;
  warrantyMonths?: number;
  country?: string;
  sleeping?: string;
  gost?: string;
};

export type Advantage = { t: string; d: string };

export const company: Company = data.company;
export const categories: Category[] = data.categories;
export const products: Product[] = data.products as Product[];
export const advantages: Advantage[] = data.advantages;

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function productsByCategory(id: string): Product[] {
  return products.filter((p) => p.category === id);
}

export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Данные карточки: всё, кроме длинного `desc`. Клиент каталога получает такие записи
 * целиком и фильтрует их без запросов к серверу.
 */
export type ProductCardData = Omit<Product, "desc">;

export function toCardData(p: Product): ProductCardData {
  const card = { ...p };
  delete card.desc;
  return card;
}

/** Строка для поиска. Собирается на клиенте, чтобы не дублировать её в пропсах. */
export function searchText(p: ProductCardData) {
  return [p.name, p.sku, p.material, p.sizes, p.gost, p.coating, ...(p.colors ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
