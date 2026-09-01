const rub = new Intl.NumberFormat("ru-RU");

export function money(n: number | null | undefined) {
  if (n == null) return "по запросу";
  return `${rub.format(n)} ₽`;
}

/** Id товаров содержат кириллицу — в путях их нужно кодировать. */
export function productHref(id: string) {
  return `/product/${encodeURIComponent(id)}`;
}
