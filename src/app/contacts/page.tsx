import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { PdConsentText } from "@/components/LegalConsent";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { MESSENGERS } from "@/data/contacts";
import { telHref } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Контакты",
  description:
    "ООО «Мебель-Сервис», 603074, Нижний Новгород, ул. Народная, 1а. Тел. +7 (985) 888-88-91. Пн–пт 9:00–17:00, заявки на info@meb-srv.ru.",
  path: "/contacts",
});

/**
 * Карта ищет адрес строкой. Точка вида — дом 1а на Народной (56.331758, 43.905510).
 */
const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?ll=43.905510%2C56.331758&z=16&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D1%83%D0%BB.%20%D0%9D%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F%2C%201%D0%B0&l=map";

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
            {company.phones.map((phone) => (
              <li key={phone}>
                <a href={telHref(phone)}>{phone}</a>
              </li>
            ))}
          </ul>
          <p className="note">{company.hours}</p>
          <RequestButton className="btn btn-ghost btn-sm">Заказать звонок</RequestButton>
        </article>

        <article className="info-card">
          <p className="mono">Написать</p>
          <ul className="contact-lines">
            {company.emails.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            ))}
          </ul>
          <p className="note">
            Заявки и коммерческие предложения — на эти адреса. Карточку предприятия высылаем по
            запросу.
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
            <li>{company.address}</li>
          </ul>
          <p className="note">
            Юридический адрес совпадает с производством. На территории пропускной режим, самовывоз
            согласуем за один рабочий день — условия на странице{" "}
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
            consent={<PdConsentText />}
          />

          <div className="map-block">
            <iframe
              className="map"
              title="Карта: ул. Народная, 1а, Нижний Новгород"
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
