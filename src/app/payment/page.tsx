import Link from "next/link";
import { Todo, TodoBlock } from "@/components/Todo";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Оплата",
  description:
    "Счёт и безналичный расчёт для юрлиц и бюджета, УПД, работа по 44-ФЗ и 223-ФЗ. Реквизиты ООО «Мебель-Сервис», мебельное производство в Нижнем Новгороде.",
  path: "/payment",
});

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

export default function PaymentPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Оплата
        </p>
        <h1>Оплата</h1>
        <p style={{ maxWidth: "62ch", marginTop: 10, color: "var(--ink-2)" }}>
          Работаем преимущественно с организациями: выставляем счёт, отгружаем по договору и
          закрываем документами. Для крупных партий условия оплаты обсуждаемы.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="mono">Юридическим лицам</p>
          <h2>Безналичный расчёт</h2>
          <p>
            Выставляем счёт по вашим реквизитам. Отгрузка после поступления средств либо на условиях{" "}
            <Todo>предоплата N%</Todo>.
          </p>
          <p className="note">Закрывающие документы: УПД или накладная и счёт-фактура.</p>
        </article>

        <article className="info-card">
          <p className="mono">Бюджетным учреждениям</p>
          <h2>44-ФЗ и 223-ФЗ</h2>
          <p>
            Участвуем в закупках, готовим коммерческие предложения для обоснования НМЦК и работаем
            по контракту.
          </p>
          <p className="note">
            Регистрация на площадках: <Todo>перечислить ЭТП</Todo>.
          </p>
        </article>

        <article className="info-card">
          <p className="mono">Физическим лицам</p>
          <h2>Наличными и картой</h2>
          <p>
            Оплата при получении на производстве. <Todo>Приём карт: да / нет</Todo>.
          </p>
          <p className="note">
            Для розничных покупок минимальная сумма заказа — <Todo>сумма</Todo>.
          </p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="payment-layout">
          <div className="text-page prose">
            <h2>Отсрочка платежа</h2>
            <p>
              Для постоянных заказчиков и крупных контрактов рассматриваем отсрочку —{" "}
              <Todo>условия и срок</Todo>. Решение принимаем по объёму заказа и истории работы.
            </p>

            <h2>Договор</h2>
            <p>
              На серийную поставку заключаем договор со спецификацией: перечень позиций, количество,
              цена, сроки изготовления и отгрузки. Изменение комплектации фиксируем дополнительным
              соглашением.
            </p>

            <TodoBlock title="Что подтвердить перед запуском страницы">
              <ul>
                <li>Размер предоплаты и условия отгрузки</li>
                <li>Работаете ли по 44-ФЗ и 223-ФЗ, на каких площадках зарегистрированы</li>
                <li>Принимаете ли карты и наличные от физлиц</li>
                <li>Минимальная сумма заказа, если она есть</li>
                <li>Условия отсрочки платежа</li>
              </ul>
            </TodoBlock>
          </div>

          <aside className="form-card">
            <p className="mono" style={{ color: "var(--copper)" }}>
              Реквизиты
            </p>
            <h2 style={{ fontSize: "1.3rem", margin: "8px 0 4px" }}>{company.legal}</h2>
            <div className="req">
              {REQUISITES.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <p className="note" style={{ marginTop: 16 }}>
              Карточку предприятия и счёт пришлём по запросу на {company.email}.
            </p>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="cta-strip">
          <div>
            <h2>Нужен счёт или коммерческое предложение?</h2>
            <p>Пришлите список позиций и реквизиты — подготовим документы в рабочее время.</p>
          </div>
          <div className="hero-actions">
            <RequestButton className="btn btn-copper">Запросить счёт</RequestButton>
            <Link className="btn btn-ghost" href="/delivery">
              Условия доставки
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
