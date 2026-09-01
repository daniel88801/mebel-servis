import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { company } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты ООО «Мебель-Сервис»: Нижний Новгород, ул. Гордеевская, 139Б. Телефоны +7 (920) 005-01-10, +7 (930) 811-73-95.",
  openGraph: {
    title: "Контакты — Мебель-Сервис",
    description: "Нижний Новгород, ул. Гордеевская, 139Б. Тел. +7 (920) 005-01-10.",
  },
};

const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?ll=43.940000%2C56.326000&z=16&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D0%93%D0%BE%D1%80%D0%B4%D0%B5%D0%B5%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20139%D0%91&l=map";

const REQUISITES: [string, string][] = [
  ["Компания", company.legal],
  ["ИНН", company.inn],
  ["КПП", company.kpp],
  ["ОГРН", company.ogrn],
  ["Р/с", company.rs],
  ["Банк", company.bank],
  ["К/с", company.ks],
  ["БИК", company.bik],
];

export default function ContactsPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Контакты
        </p>
        <h1>Контакты</h1>
        <p style={{ marginTop: 8, color: "var(--ink-2)" }}>Приём звонков: Пн–Пт с 9:00 до 17:00</p>
      </div>

      <div className="contacts-grid" style={{ paddingBottom: 56 }}>
        <div>
          <p>
            <strong>Телефоны</strong>
            <br />
            <a href="tel:+79200050110">{company.phones[0]}</a>
            <br />
            <a href="tel:+79308117395">{company.phones[1]}</a>
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>Почта</strong>
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>Адрес</strong>
            <br />
            603116, Нижний Новгород,
            <br />
            ул. Гордеевская, 139Б
          </p>

          <h2 style={{ marginTop: 28, fontSize: "1.3rem" }}>Реквизиты</h2>
          <div className="req">
            {REQUISITES.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <LeadForm
            variant="contacts"
            className="form-card form-grid"
            style={{ marginTop: 28 }}
            heading={<h3>Написать нам</h3>}
            submitLabel="Отправить"
            okText="Сообщение отправлено. Ответим в рабочее время."
            consent={
              <>
                Согласен с <Link href="/privacy">политикой конфиденциальности</Link>
              </>
            }
          />
        </div>
        <iframe
          className="map"
          title="Карта: Гордеевская 139Б, Нижний Новгород"
          src={MAP_SRC}
          loading="lazy"
        />
      </div>
    </main>
  );
}
