import Link from "next/link";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Оплата",
  description:
    "Безналичный расчёт для организаций: предоплата 50%, закрывающие документы — УПД. Работа по 44-ФЗ и 223-ФЗ. Реквизиты ООО «Мебель-Сервис», Нижний Новгород.",
  path: "/payment",
});

const REQUISITES: [string, string][] = [
  ["Компания", company.legal],
  ["ИНН / КПП", `${company.inn} / ${company.kpp}`],
  ["ОГРН", company.ogrn],
  ["ОКПО", company.okpo],
  ["ОКТМО", company.oktmo],
  ["ОКОГУ", company.okogu],
  ["ОКФС", company.okfs],
  ["ОКОПФ", company.okopf],
  ["ОКВЭД", company.okved],
  ["Банк", company.bank],
  ["Юр. адрес", company.address],
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
          Розницы нет. Работаем с организациями: счёт, договор и закрывающие документы. Карты и
          наличные на производстве не принимаем.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="mono">Юридическим лицам</p>
          <h2>Безналичный расчёт</h2>
          <p>
            Предоплата 50% по счёту.
          </p>
          <p className="note">Закрывающие документы: УПД.</p>
        </article>

        <article className="info-card">
          <p className="mono">Бюджетным учреждениям</p>
          <h2>44-ФЗ и 223-ФЗ</h2>
          <p>
            Работаем по 44-ФЗ и 223-ФЗ: готовим коммерческие предложения для обоснования НМЦК и
            поставляем по контракту.
          </p>
          <p className="note">На электронных торговых площадках не зарегистрированы.</p>
        </article>

        <article className="info-card">
          <p className="mono">Физическим лицам</p>
          <h2>Розницы нет</h2>
          <p>Карты и наличные на производстве не принимаем. Заказы — только от организаций.</p>
          <p className="note">Отсрочки платежа нет.</p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="payment-layout">
          <div className="text-page prose">
            <h2>Отсрочка платежа</h2>
            <p>Отсрочку не предоставляем. Оплата — предоплата 50% по счёту.</p>

            <h2>Договор</h2>
            <p>
              На серийную поставку заключаем договор со спецификацией: перечень позиций, количество,
              цена, сроки изготовления и отгрузки. Изменение комплектации фиксируем дополнительным
              соглашением. Декларации и сертификаты по ТР ТС 025/2012 высылаем к отгрузке по
              запросу.
            </p>
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
              Карточку предприятия PDF и счёт пришлём по запросу на {company.emails.join(" или ")}.
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
