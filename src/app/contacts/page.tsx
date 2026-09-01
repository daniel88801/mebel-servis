import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { MESSENGERS } from "@/data/contacts";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты ООО «Мебель-Сервис»: Нижний Новгород, ул. Гордеевская, 139Б. Телефоны +7 (920) 005-01-10, +7 (930) 811-73-95.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакты — Мебель-Сервис",
    description: "Нижний Новгород, ул. Гордеевская, 139Б. Тел. +7 (920) 005-01-10.",
  },
};

/**
 * Карта ищет адрес строкой, а не ставит метку по координатам: координаты в репозитории
 * приблизительные и метка вставала в соседний квартал. Яндекс на такой поиск раскрывает
 * балун с карточкой дома — его можно убрать, когда будут выверенные координаты
 * и параметр `pt=`.
 */
const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?ll=43.940000%2C56.326000&z=16&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D0%93%D0%BE%D1%80%D0%B4%D0%B5%D0%B5%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20139%D0%91&l=map";

const PHONE_LINKS = ["tel:+79200050110", "tel:+79308117395"];

export default function ContactsPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Контакты
        </p>
        <h1>Контакты</h1>
        <p style={{ maxWidth: "58ch", marginTop: 10, color: "var(--ink-2)" }}>
          Отдел продаж отвечает в рабочее время. Если нужен расчёт партии, сразу приложите список
          позиций или техническое задание — так ответим быстрее.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="mono">Позвонить</p>
          <ul className="contact-lines">
            {company.phones.map((phone, i) => (
              <li key={phone}>
                <a href={PHONE_LINKS[i]}>{phone}</a>
              </li>
            ))}
          </ul>
          <p className="note">{company.hours}</p>
          <RequestButton className="btn btn-ghost btn-sm">Заказать звонок</RequestButton>
        </article>

        <article className="info-card">
          <p className="mono">Написать</p>
          <ul className="contact-lines">
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
          </ul>
          <p className="note">
            Счёт, коммерческое предложение и карточку предприятия высылаем по запросу.
          </p>
          {MESSENGERS.length > 0 && (
            <p className="note">
              Мессенджеры:{" "}
              {MESSENGERS.map((m) => (
                <a key={m.id} href={m.href} target="_blank" rel="noreferrer noopener">
                  {m.label}
                </a>
              ))}
            </p>
          )}
        </article>

        <article className="info-card">
          <p className="mono">Приехать</p>
          <ul className="contact-lines">
            <li>
              603116, Нижний Новгород,
              <br />
              ул. Гордеевская, 139Б
            </li>
          </ul>
          <p className="note">
            Производство и отгрузка. Самовывоз согласовываем заранее — условия на странице{" "}
            <Link href="/delivery">доставки</Link>.
          </p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 40, paddingBottom: 72 }}>
        <div className="contacts-grid">
          <LeadForm
            variant="contacts"
            className="form-card form-grid"
            heading={
              <>
                <p className="mono" style={{ color: "var(--copper)" }}>
                  Обращение
                </p>
                <h2 style={{ fontSize: "1.4rem", letterSpacing: "-0.02em", margin: "6px 0 4px" }}>
                  Написать нам
                </h2>
              </>
            }
            submitLabel="Отправить"
            okText="Сообщение отправлено. Ответим в рабочее время."
            consent={
              <>
                Согласен с <Link href="/privacy">политикой конфиденциальности</Link>
              </>
            }
          />

          <div className="map-block">
            <iframe
              className="map"
              title="Карта: Гордеевская 139Б, Нижний Новгород"
              src={MAP_SRC}
              loading="lazy"
            />
            <p className="note">
              {company.legal} · ИНН {company.inn} · ОГРН {company.ogrn}.{" "}
              <Link href="/payment">Полные реквизиты</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
