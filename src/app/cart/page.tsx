import Link from "next/link";
import { CartView } from "@/components/CartView";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Корзина заявки",
  description:
    "Спецификация для коммерческого предложения: соберите кровати, шкафы и мебель на каркасе и отправьте заявку в ООО «Мебель-Сервис», Нижний Новгород.",
  path: "/cart",
  robots: { index: false },
});

export default function CartPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Корзина
        </p>
        <h1>Корзина</h1>
        <p style={{ maxWidth: "62ch", marginTop: 10, color: "var(--ink-2)" }}>
          Соберите спецификацию и оформите заказ. Цены «от» — ориентир; счёт выставим после
          подтверждения партии.
        </p>
      </div>
      <CartView />
    </main>
  );
}
