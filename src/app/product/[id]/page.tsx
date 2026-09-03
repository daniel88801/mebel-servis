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
          {product.desc && <p style={{ whiteSpace: "pre-line" }}>{product.desc}</p>}
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
          <table className="spec">
            <tbody>
              <tr>
                <td>Артикул</td>
                <td>{product.sku || "—"}</td>
              </tr>
              {category && (
                <tr>
                  <td>Категория</td>
                  <td>
                    <Link href={`/catalog/${category.id}`}>{category.name}</Link>
                  </td>
                </tr>
              )}
              {product.sizes && (
                <tr>
                  <td>Габариты</td>
                  <td>{product.sizes}</td>
                </tr>
              )}
              {product.material && (
                <tr>
                  <td>Материалы</td>
                  <td>{product.material}</td>
                </tr>
              )}
              {product.coating && (
                <tr>
                  <td>Покрытие</td>
                  <td>{product.coating}</td>
                </tr>
              )}
              {product.sleeping && (
                <tr>
                  <td>Спальное место</td>
                  <td>{product.sleeping}</td>
                </tr>
              )}
              {product.load != null && (
                <tr>
                  <td>Нагрузка</td>
                  <td>до {product.load} кг</td>
                </tr>
              )}
              {product.weight != null && (
                <tr>
                  <td>Вес</td>
                  <td>{product.weight} кг</td>
                </tr>
              )}
              {product.volume != null && (
                <tr>
                  <td>Объём упаковки</td>
                  <td>{product.volume} м³</td>
                </tr>
              )}
              {product.gost && (
                <tr>
                  <td>Соответствие</td>
                  <td>{product.gost}</td>
                </tr>
              )}
              {product.warranty && (
                <tr>
                  <td>Гарантия</td>
                  <td>{product.warranty}</td>
                </tr>
              )}
              {product.country && (
                <tr>
                  <td>Производство</td>
                  <td>{product.country}</td>
                </tr>
              )}
              {!!product.colors?.length && (
                <tr>
                  <td>Декоры</td>
                  <td>
                    <span className="colors">
                      {product.colors.map((c) => (
                        <span className="color" key={c}>
                          {c}
                        </span>
                      ))}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
