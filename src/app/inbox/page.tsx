import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InboxLogin } from "@/components/InboxLogin";
import { InboxLogout } from "@/components/InboxLogout";
import { hasInboxSession, inboxConfigured } from "@/lib/inbox";
import { DELIVERY_LABEL, listRecentLeads, listRecentOrders, ORDER_STATUS } from "@/lib/store";

export const metadata: Metadata = {
  title: "Служебная лента",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  if (!inboxConfigured()) notFound();
  const ok = await hasInboxSession();

  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Служебная лента
        </p>
        <div className="account-hero">
          <div>
            <h1>Служебная лента</h1>
            <p style={{ maxWidth: "58ch", marginTop: 10, color: "var(--ink-2)" }}>
              Заявки и заказы хранятся на сервере в РФ. В мессенджер уходит только номер.
            </p>
          </div>
          {ok ? <InboxLogout /> : null}
        </div>
      </div>
      {ok ? <InboxBody /> : <InboxLogin />}
    </main>
  );
}

function InboxBody() {
  const leads = listRecentLeads(100);
  const orders = listRecentOrders(50);
  return (
    <>
      <section className="section" style={{ paddingTop: 8 }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Заявки</h2>
        {leads.length === 0 ? (
          <p className="note">Пока нет заявок с форм.</p>
        ) : (
          <ul className="quote-list">
            {leads.map((lead) => (
              <li key={lead.id} className="quote-card">
                <p className="mono card-sku">
                  {lead.number} · {new Date(lead.created_at).toLocaleString("ru-RU")}
                </p>
                <p>
                  {lead.name} · {lead.phone}
                  {lead.company ? ` · ${lead.company}` : ""}
                </p>
                {lead.product ? <p>Позиция: {lead.product}</p> : null}
                {lead.comment ? <p>{lead.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="section">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Заказы из кабинета</h2>
        {orders.length === 0 ? (
          <p className="note">Пока нет заказов.</p>
        ) : (
          <ul className="quote-list">
            {orders.map((order) => (
              <li key={order.id} className="quote-card">
                <p className="mono card-sku">
                  {order.number} · {ORDER_STATUS[order.status] ?? order.status} ·{" "}
                  {new Date(order.created_at).toLocaleString("ru-RU")}
                </p>
                <p>
                  {order.name} · {order.phone}
                  {order.company ? ` · ${order.company}` : ""}
                </p>
                <p>{DELIVERY_LABEL[order.delivery] ?? order.delivery}</p>
                {order.address ? <p>{order.address}</p> : null}
                {order.comment ? <p>{order.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
