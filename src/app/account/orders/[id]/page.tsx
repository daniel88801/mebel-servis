import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { money, productHref } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import { DELIVERY_LABEL, getOrder, ORDER_STATUS } from "@/lib/store";

export const metadata = pageMeta({
  title: "Заказ",
  description:
    "Карточка заказа в кабинете ООО «Мебель-Сервис». Страница доступна только владельцу заявки на металлическую и ЛДСП-мебель из Нижнего Новгорода.",
  robots: { index: false, follow: true },
});

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const { id } = await params;
  const order = getOrder(user.id, id);
  if (!order) notFound();

  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / <Link href="/account">Кабинет</Link> / {order.number}
        </p>
        <h1>Заказ {order.number}</h1>
        <p style={{ marginTop: 10, color: "var(--ink-2)" }}>
          {ORDER_STATUS[order.status] ?? order.status} ·{" "}
          {new Date(order.created_at).toLocaleString("ru-RU")}
        </p>
      </div>

      <div className="cart-layout" style={{ paddingBottom: 60 }}>
        <ul className="cart-list">
          {order.items.map((item) => (
            <li key={item.sku + item.product_id} className="cart-line">
              <Link href={productHref(item.product_id)} className="cart-thumb">
                <Image src={item.image} alt="" width={88} height={88} />
              </Link>
              <div>
                <span className="mono card-sku">{item.sku}</span>
                <h3>
                  <Link href={productHref(item.product_id)}>{item.name}</Link>
                </h3>
                <p className="note">
                  {item.qty} шт.
                  {item.price != null ? ` · от ${money(item.price)}` : " · по запросу"}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="form-card">
          <p className="mono" style={{ color: "var(--copper)" }}>
            Реквизиты заявки
          </p>
          <h2 style={{ fontSize: "1.3rem", margin: "6px 0 16px" }}>{order.name}</h2>
          <table className="spec">
            <tbody>
              <tr>
                <td>Телефон</td>
                <td>{order.phone}</td>
              </tr>
              {order.company && (
                <tr>
                  <td>Компания</td>
                  <td>{order.company}</td>
                </tr>
              )}
              <tr>
                <td>Получение</td>
                <td>{DELIVERY_LABEL[order.delivery] ?? order.delivery}</td>
              </tr>
              {order.address && (
                <tr>
                  <td>Адрес</td>
                  <td>{order.address}</td>
                </tr>
              )}
              {order.comment && (
                <tr>
                  <td>Комментарий</td>
                  <td>{order.comment}</td>
                </tr>
              )}
              <tr>
                <td>Ориентир</td>
                <td>{order.total != null ? <>от {money(order.total)}</> : "по запросу"}</td>
              </tr>
            </tbody>
          </table>
          <p className="note" style={{ marginTop: 16 }}>
            Свяжемся в рабочее время, подтвердим состав и выставим счёт.
          </p>
          <Link className="btn btn-ghost" href="/account" style={{ marginTop: 16 }}>
            К списку заказов
          </Link>
        </div>
      </div>
    </main>
  );
}
