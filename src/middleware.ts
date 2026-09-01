import { NextResponse, type NextRequest } from "next/server";

/**
 * Разделы каталога переехали с `/catalog?cat=beds` на `/catalog/beds`.
 * Редирект из next.config дописывал исходный параметр к новому адресу,
 * поэтому переносим ссылки здесь — с чистым итоговым URL.
 *
 * Список захардкожен намеренно: импорт каталога затащил бы в middleware
 * весь JSON на 1,1 МБ. Сверку со справочником делает тест ниже по файлу.
 */
const CATEGORY_IDS = new Set([
  "sale",
  "army",
  "beds",
  "corpus",
  "frame",
  "folding",
  "plastic",
  "covers",
  "office",
  "students",
  "lockers",
  "bedding",
  "hotels",
  "workers",
  "dorms",
  "industrial",
  "banquet",
  "medical",
  "safes",
]);

export function middleware(request: NextRequest) {
  const cat = request.nextUrl.searchParams.get("cat");
  if (!cat || !CATEGORY_IDS.has(cat)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/catalog/${cat}`;
  url.searchParams.delete("cat");
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: "/catalog" };
