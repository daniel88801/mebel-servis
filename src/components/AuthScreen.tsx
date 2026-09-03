import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const POINTS = [
  "Заказы и профиль хранятся на сервере",
  "Корзина переносится в кабинет после входа",
  "Счёт выставляем после коммерческого предложения",
];

export function AuthScreen({
  crumb,
  title,
  lead,
  children,
}: {
  crumb: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-screen" id="content">
      <aside className="auth-visual">
        <Image
          src="/images/hero/hotel.jpg"
          alt="Интерьер с мебелью Мебель-Сервис"
          fill
          priority
          sizes="(max-width: 980px) 100vw, 52vw"
        />
        <div className="auth-visual-body">
          <p className="mono auth-visual-kicker">Кабинет закупщика</p>
          <h2>Спецификации и заказы в одном месте</h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="auth-panel">
        <p className="crumbs">
          <Link href="/">Главная</Link> / {crumb}
        </p>
        <h1>{title}</h1>
        <p className="auth-lead">{lead}</p>
        {children}
      </section>
    </main>
  );
}
