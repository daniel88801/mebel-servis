import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { Todo, TodoBlock } from "@/components/Todo";
import { categories, company, products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Оптом и на объект",
  description:
    "Оптовые и комплексные поставки мебели для объектов: серийные партии, изготовление по ТЗ, расчёт сметы и оптовый прайс по запросу. Производство в Нижнем Новгороде.",
  alternates: { canonical: "/wholesale" },
};

const STEPS = [
  {
    title: "Присылаете задачу",
    text: "Список позиций, спецификацию или просто описание объекта: сколько мест, какие помещения, к какому сроку.",
  },
  {
    title: "Считаем партию",
    text: "Подбираем позиции из каталога или адаптируем конструкцию под ТЗ. Готовим коммерческое предложение с ценой за партию.",
  },
  {
    title: "Фиксируем в договоре",
    text: "Спецификация с количеством, ценой и сроками. Для бюджетных заказчиков работаем по 44-ФЗ и 223-ФЗ.",
  },
  {
    title: "Производим и отгружаем",
    text: "Серия выпускается по единым требованиям. Отгружаем целиком или партиями под график монтажа.",
  },
];

export default function WholesalePage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Оптом
        </p>
        <h1>Оптом и на объект</h1>
        <p style={{ maxWidth: "62ch", marginTop: 10, color: "var(--ink-2)" }}>
          Собственное производство площадью более 4 000 м² рассчитано на серийные заказы. Работаем с
          военными и ведомственными объектами, общежитиями, образовательными и социальными
          учреждениями, промышленными и административными помещениями.
        </p>
      </div>

      <div className="stat-row">
        <div>
          <b>{products.length}</b>
          <span>позиций в каталоге</span>
        </div>
        <div>
          <b>{categories.length}</b>
          <span>разделов по типам объектов</span>
        </div>
        <div>
          <b>4 000+</b>
          <span>м² собственного производства</span>
        </div>
        <div>
          <b>
            <Todo>N</Todo>
          </b>
          <span>минимальная партия для оптовой цены</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
              Что получает оптовый заказчик
            </p>
            <h2>Условия для крупных заказов</h2>
          </div>
        </div>
        <div className="info-grid">
          <article className="info-card">
            <h2>Оптовая цена</h2>
            <p>
              Цены в каталоге ориентировочные и указаны от. Для партии считаем отдельно — скидка
              зависит от объёма: <Todo>шкала скидок по объёму</Todo>.
            </p>
          </article>
          <article className="info-card">
            <h2>Изготовление по ТЗ</h2>
            <p>
              Меняем размеры, комплектацию, цвет каркаса и декор ЛДСП под требования проекта. Вся
              серия выпускается по единым требованиям.
            </p>
          </article>
          <article className="info-card">
            <h2>Помощь со сметой</h2>
            <p>
              Поможем собрать спецификацию под объект и подготовим коммерческое предложение для
              обоснования начальной цены контракта.
            </p>
          </article>
          <article className="info-card">
            <h2>Один менеджер</h2>
            <p>
              Ведёт заказ от расчёта до отгрузки: согласование ТЗ, сроки, документы, график поставки
              партиями.
            </p>
          </article>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
              Порядок работы
            </p>
            <h2>Как проходит поставка</h2>
          </div>
        </div>
        <ol className="steps-list">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="mono">0{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="text-page prose">
          <TodoBlock title="Что подтвердить перед запуском страницы">
            <ul>
              <li>Минимальная партия или сумма, с которой действует оптовая цена</li>
              <li>Шкала скидок по объёму</li>
              <li>Нужны ли реквизиты покупателя для выдачи прайса</li>
              <li>Оказываете ли сборку и расстановку на объекте</li>
              <li>Примеры выполненных объектов — их стоит вынести в отдельный раздел</li>
            </ul>
          </TodoBlock>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="wrap home-lead" style={{ width: "100%" }}>
          <div>
            <p className="mono" style={{ color: "var(--copper)" }}>
              Оптовый прайс
            </p>
            <h2 style={{ fontSize: "2rem", letterSpacing: "-0.03em", margin: "8px 0 12px" }}>
              Пришлём прайс и посчитаем партию
            </h2>
            <p>
              Опишите объект и объём — подготовим коммерческое предложение с учётом сроков и
              адаптации изделий под ваше ТЗ.
            </p>
            <p style={{ marginTop: 12, color: "var(--ink-2)" }}>
              Телефон:{" "}
              <a href="tel:+79200050110">
                <strong>{company.phones[0]}</strong>
              </a>
              <br />
              Почта: <a href={`mailto:${company.email}`}>{company.email}</a>
              <br />
              {company.hours}
            </p>
          </div>
          <LeadForm
            variant="home"
            className="form-card form-grid"
            submitLabel="Запросить прайс"
            okText="Заявка принята. Пришлём прайс и расчёт в рабочее время."
            consent={
              <>
                Согласен с <Link href="/privacy">политикой обработки персональных данных</Link>
              </>
            }
          />
        </div>
      </section>
    </main>
  );
}
