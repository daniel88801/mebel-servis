import { ogProduct, ogSize, ogType } from "@/lib/og";
import { categoryById, productById } from "@/data/catalog";
import { money } from "@/lib/format";

export const alt = "Товар Мебель-Сервис, производство в Нижнем Новгороде";
export const size = ogSize;
export const contentType = ogType;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const product = productById(decodeURIComponent((await params).id));
  if (!product) {
    return ogProduct({
      photo: "/images/og/catalog.jpg",
      kicker: "Каталог",
      title: "Мебель-Сервис",
      sku: "",
      price: "",
    });
  }
  const category = categoryById(product.category);
  const price = product.price == null ? "Цена по запросу" : `от ${money(product.price)}`;
  return ogProduct({
    photo: product.image,
    kicker: category?.name ?? "Каталог",
    title: product.name,
    sku: product.sku,
    price,
  });
}
