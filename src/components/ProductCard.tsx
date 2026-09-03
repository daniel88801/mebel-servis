import Image from "next/image";
import Link from "next/link";
import { money, productHref } from "@/lib/format";
import type { ProductCardData } from "@/data/catalog";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: ProductCardData }) {
  const href = productHref(product.id);
  const sale = product.category === "sale";
  return (
    <article className={`card${sale ? " card-sale" : ""}`}>
      <Link href={href} className="card-img-wrap">
        <div className="card-img">
          <Image
            src={product.image}
            alt={product.name}
            width={480}
            height={480}
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
          />
        </div>
        {sale ? (
          <span className="badge badge-sale">Распродажа</span>
        ) : (
          product.badge && <span className="badge">{product.badge}</span>
        )}
      </Link>
      <div className="card-body">
        <span className="mono card-sku">{product.sku}</span>
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        {product.sizes && <p className="note">{product.sizes}</p>}
        <div className="price">
          {product.price == null ? (
            "по запросу"
          ) : (
            <>
              <small>от</small> {money(product.price)}
            </>
          )}
        </div>
        <div className="product-actions">
          <Link className="btn btn-ghost btn-sm" href={href}>
            Подробнее
          </Link>
          <AddToCartButton
            className="btn btn-copper btn-sm"
            product={{
              id: product.id,
              sku: product.sku,
              name: product.name,
              image: product.image,
              price: product.price,
            }}
          />
        </div>
      </div>
    </article>
  );
}
