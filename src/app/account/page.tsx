import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { listOrders, ORDER_STATUS } from "@/lib/store";

export const metadata: Metadata = {
  title: "Кабинет",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = listOrders(user.id);

  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Кабинет
        </p>
        <div className="account-hero">
          <div>
            <h1>Кабинет</h1>
            <p style={{ maxWidth: "58ch", marginTop: 10, color: "var(--ink-2)" }}>
              {user.email}. Заказы и профиль хранятся на сервере. Оплата — по счёту после КП.
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="account-grid">
        <ProfileForm name={user.name} phone={user.phone} company={user.company} />
        <div className="account-side">
          <div className="fact">
            <b>{orders.length}</b>
            <span>заказов в кабинете</span>
            <Link className="btn btn-ghost btn-sm" href="/cart" style={{ marginTop: 12 }}>
              Корзина
            </Link>
          </div>
          <div className="fact">
            <b>PDF</b>
            <span>Прайс-каталог</span>
            <a
              className="btn btn-copper btn-sm"
              href="/downloads/mebel-servis-katalog.pdf"
              download
              style={{ marginTop: 12 }}
            >
              Скачать каталог
            </a>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Заказы</h2>
        {orders.length === 0 ? (
          <p className="note">Пока нет заказов. Соберите спецификацию в корзине и оформите заявку.</p>
        ) : (
          <ul className="quote-list">
            {orders.map((o) => (
              <li key={o.id}>
                <Link className="quote-card quote-link" href={`/account/orders/${o.id}`}>
                  <p className="mono card-sku">
                    {o.number} · {ORDER_STATUS[o.status] ?? o.status}
                  </p>
                  <p>
                    {new Date(o.created_at).toLocaleString("ru-RU")}
                    {o.total != null ? ` · ориентир от ${money(o.total)}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
