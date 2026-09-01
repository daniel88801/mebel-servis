import Image from "next/image";
import Link from "next/link";
import { money, productHref } from "@/lib/format";
import type { ProductCardData } from "@/data/catalog";
import { RequestButton } from "./RequestModal";

export function ProductCard({ product }: { product: ProductCardData }) {
  const href = productHref(product.id);
  return (
    <article className="card">
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
        {product.badge && <span className="badge">{product.badge}</span>}
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
              {money(product.price)} <small>от</small>
            </>
          )}
        </div>
        <div className="product-actions">
          <Link className="btn btn-ghost btn-sm" href={href}>
            Подробнее
          </Link>
          <RequestButton
            className="btn btn-copper btn-sm"
            product={`${product.name} [${product.sku}]`}
          >
            В заявку
          </RequestButton>
        </div>
      </div>
    </article>
  );
}
