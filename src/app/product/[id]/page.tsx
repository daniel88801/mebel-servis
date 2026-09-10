import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { RequestButton } from "@/components/RequestModal";
import { AddToCartButton } from "@/components/AddToCartButton";
import { money, productHref } from "@/lib/format";
import {
  categoryById,
  company,
  productById,
  products,
  productsByCategory,
  toCardData,
  type Product,
} from "@/data/catalog";
import { absolute } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = productById(decodeURIComponent((await params).id));
  if (!product) return { title: "Товар не найден" };
  const price = product.price == null ? "цена по запросу" : `от ${money(product.price)}`;
  return {
    title: `${product.name} — ${product.sku}`,
    description: `${product.name} (${product.sku}). ${product.sizes ? `Габариты ${product.sizes} мм. ` : ""}${price}.`,
    openGraph: { images: [product.image] },
    alternates: { canonical: productHref(product.id) },
  };
}

/** Описание от производителя — те же пары «свойство: значение», только строками.
 *  Разбираем их в таблицу, а всё, что не разложилось в пару, уходит в примечание. */
function parseDesc(desc?: string) {
  const rows: { label: string; value: string }[] = [];
  const notes: string[] = [];
  for (const raw of (desc ?? "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("*")) {
      notes.push(line.replace(/^\*\s*/, ""));
      continue;
    }
    const pair = line.match(/^([^:]{2,48}):\s*(.+)$/);
    if (pair) rows.push({ label: pair[1].trim(), value: pair[2].trim().replace(/\.$/, "") });
    else notes.push(line);
  }
  return { rows, notes };
}

/** Два ключа на строку. Строгий различает «Вес (нетто)» и «Вес (брутто)» —
 *  обе строки нужны. Мягкий отбрасывает скобки, чтобы «Габаритные размеры (ДхШхВ)»
 *  из описания перекрывали разобранное поле «Габариты». */
const normStrict = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z]/g, "");

const norm = (s: string) => normStrict(s.replace(/\([^)]*\)/g, ""));

const ALIASES: Record<string, string[]> = {
  габариты: ["габаритныеразмеры", "размеры"],
  материалы: ["материал"],
  нагрузка: ["нагрузканаспальноеместо"],
  вес: ["веснетто", "весбрутто"],
  объемупаковки: ["объем", "объемупаковки"],
  декоры: ["цвет"],
  соответствие: ["гост"],
};

/** Одна таблица на всю карточку: сначала артикул и раздел, затем описание
 *  производителя, затем разобранные поля, которых в описании не было. */
function SpecTable({
  product,
  category,
}: {
  product: Product;
  category?: { id: string; name: string };
}) {
  const { rows: descRows, notes } = parseDesc(product.desc);
  const strictUsed = new Set<string>();
  const looseUsed = new Set<string>();
  const out: { label: string; value: React.ReactNode }[] = [];

  /** Описание сверяется по строгому ключу, разобранные поля — ещё и по мягкому
   *  вместе с псевдонимами: так они не дублируют то, что уже сказал производитель. */
  const push = (label: string, value: React.ReactNode, fromDesc = false) => {
    const strict = normStrict(label);
    const loose = norm(label);
    if (strictUsed.has(strict)) return;
    if (!fromDesc && [loose, ...(ALIASES[loose] ?? [])].some((k) => looseUsed.has(k))) return;
    strictUsed.add(strict);
    looseUsed.add(loose);
    out.push({ label, value });
  };

  push("Артикул", product.sku || "—");
  if (category) push("Раздел", <Link href={`/catalog/${category.id}`}>{category.name}</Link>);
  for (const row of descRows) push(row.label, row.value, true);
  if (product.sizes) push("Габариты", `${product.sizes} мм`);
  if (product.material) push("Материалы", product.material);
  if (product.coating) push("Покрытие", product.coating);
  if (product.sleeping) push("Спальное место", product.sleeping);
  if (product.load != null) push("Нагрузка", `до ${product.load} кг`);
  if (product.weight != null) push("Вес", `${product.weight} кг`);
  if (product.volume != null) push("Объём упаковки", `${product.volume} м³`);
  if (product.gost) push("Соответствие", product.gost);
  if (product.warranty) push("Гарантия", product.warranty);
  if (product.country) push("Производство", product.country);
  if (product.colors?.length) {
    push(
      "Декоры",
      <span className="colors">
        {product.colors.map((c: string) => (
          <span className="color" key={c}>
            {c}
          </span>
        ))}
      </span>,
    );
  }

  return (
    <>
      <table className="spec">
        <tbody>
          {out.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {notes.length > 0 && (
        <div className="spec-notes">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}
    </>
  );
}

export default async function ProductPage({ params }: Props) {
  const product = productById(decodeURIComponent((await params).id));
  if (!product) notFound();

  const category = categoryById(product.category);
  const related = productsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map(toCardData);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: absolute(product.image),
    description: product.desc ?? product.name,
    category: category?.name,
    brand: { "@type": "Brand", name: company.name },
    ...(product.gost
      ? {
          additionalProperty: [
            { "@type": "PropertyValue", name: "Соответствие", value: product.gost },
          ],
        }
      : {}),
    ...(product.weight != null
      ? { weight: { "@type": "QuantitativeValue", value: product.weight, unitCode: "KGM" } }
      : {}),
    offers: {
      "@type": "Offer",
      url: absolute(productHref(product.id)),
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: company.legal },
      ...(product.price == null
        ? {}
        : { price: product.price, priceValidUntil: `${new Date().getFullYear() + 1}-12-31` }),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absolute("/") },
      { "@type": "ListItem", position: 2, name: "Каталог", item: absolute("/catalog") },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: absolute(`/catalog/${category.id}`),
            },
          ]
        : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: product.name },
    ],
  };

  return (
    <main className="wrap" id="content">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link>
          {category && (
            <>
              {" / "}
              <Link href={`/catalog/${category.id}`}>{category.name}</Link>
            </>
          )}
          {" / "}
          {product.sku}
        </p>
      </div>

      <div className="product">
        <div className="product-gallery">
          <Image
            src={product.image}
            alt={product.name}
            width={900}
            height={900}
            priority
            sizes="(max-width: 980px) 100vw, 50vw"
          />
          {product.category === "sale" && (
            <span className="badge badge-sale">Распродажа</span>
          )}
          <div className="gallery-plate">
            <span>{product.sku}</span>
            {product.sizes && <span>{product.sizes} мм</span>}
          </div>
        </div>
        <div>
          <p className="mono" style={{ color: "var(--copper)" }}>
            {product.sku}
            {product.category === "sale"
              ? " · Распродажа"
              : product.badge
                ? ` · ${product.badge}`
                : ""}
          </p>
          <h1>{product.name}</h1>
          <div className="price" style={{ fontSize: "1.6rem", marginTop: 16 }}>
            {product.price == null ? (
              "Цена по запросу"
            ) : (
              <>
                <small>от</small> {money(product.price)}{" "}
                <small>оптовая цена — по запросу</small>
              </>
            )}
          </div>
          <SpecTable product={product} category={category} />
          <div className="product-actions">
            <AddToCartButton
              className="btn btn-copper"
              product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                image: product.image,
                price: product.price,
              }}
            />
            <RequestButton className="btn btn-primary" product={`${product.name} [${product.sku}]`}>
              Запросить коммерческое предложение
            </RequestButton>
            {category && (
              <Link className="btn btn-ghost" href={`/catalog/${category.id}`}>
                В категорию
              </Link>
            )}
          </div>
          <p className="note">
            Изготавливаем по ТЗ: размеры, комплектация, цвет каркаса и декор ЛДСП.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <div className="section-head">
            <h2>Из этой категории</h2>
          </div>
          <div className="grid-4" style={{ paddingBottom: 48 }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
