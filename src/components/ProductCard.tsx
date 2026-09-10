import Image from "next/image";
import Link from "next/link";
import { money, productHref } from "@/lib/format";
import type { ProductCardData } from "@/data/catalog";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: ProductCardData }) {
  const href = productHref(product.id);
  const sale = product.category === "sale";
  // Строка характеристик под названием: габариты, цвет, нагрузка — как в макете
  const spec = [
    product.sizes,
    product.colorTags?.[0] ?? product.colors?.[0],
    product.load ? `до ${product.load} кг` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={`card${sale ? " card-sale" : ""}`}>
      <Link href={href} className="card-img-wrap">
        <div className="card-img">
          <Image
            src={product.image}
            alt={product.name}
            width={480}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
          />
        </div>
      </Link>
      <div className="card-body">
        <span className="mono card-sku">{product.sku}</span>
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        {spec && <p className="card-spec">{spec}</p>}
        <div className="card-badges">
          {sale && <span className="badge badge-sale">Распродажа</span>}
          {!sale && product.gost && <span className="badge badge-gost">{product.gost}</span>}
          {!sale && !product.gost && product.badge && (
            <span className="badge">{product.badge}</span>
          )}
        </div>
        <div className="card-foot">
          <div className="price">
            {product.price == null ? (
              "по запросу"
            ) : (
              <>
                <small>от</small>
                {money(product.price)}
              </>
            )}
          </div>
          <AddToCartButton
            className="btn btn-ghost btn-sm"
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
