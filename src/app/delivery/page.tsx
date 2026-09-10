import Link from "next/link";
import { Todo, TodoBlock } from "@/components/Todo";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Доставка",
  description:
    "Самовывоз с производства на Гордеевской, 139Б в Нижнем Новгороде, доставка по городу и области, отправка металлической и ЛДСП-мебели по России транспортными компаниями.",
  path: "/delivery",
});

export default function DeliveryPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Доставка
        </p>
        <h1>Доставка</h1>
        <p style={{ maxWidth: "62ch", marginTop: 10, color: "var(--ink-2)" }}>
          Отгружаем как отдельные позиции, так и комплектацию целого объекта. Крупные партии
          планируем заранее: рассчитываем объём, подбираем транспорт и согласуем дату отгрузки.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="mono">01 · Самовывоз</p>
          <h2>С производства</h2>
          <p>{company.address}</p>
          <p className="note">Приём и отгрузка: {company.hours}</p>
          <p>
            Отгрузка <Todo>согласовывается за N рабочих дней</Todo>. Юридическому лицу нужны
            оригинал доверенности и паспорт получателя либо печать организации.
          </p>
        </article>

        <article className="info-card">
          <p className="mono">02 · Нижний Новгород и область</p>
          <h2>Доставка по городу</h2>
          <p>
            Стоимость: <Todo>тариф по городу</Todo>, за пределами города —{" "}
            <Todo>тариф за километр</Todo>.
          </p>
          <p>
            Бесплатно при заказе от <Todo>сумма</Todo>.
          </p>
          <p className="note">
            Доставка до подъезда или до ворот объекта. Подъём, занос и расстановку согласуем
            отдельно.
          </p>
        </article>

        <article className="info-card">
          <p className="mono">03 · Регионы России</p>
          <h2>Транспортными компаниями</h2>
          <p>
            Отгружаем через ТК до терминала в вашем городе. Доставка до терминала —{" "}
            <Todo>тариф</Todo>, дальше по тарифам перевозчика.
          </p>
          <p className="note">
            Работаем с <Todo>перечислить ТК</Todo>. Можем отгрузить и вашему перевозчику.
          </p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="text-page prose">
          <h2>Сроки</h2>
          <p>
            Позиции со склада отгружаем <Todo>срок</Todo>. Серийная партия под заказ —{" "}
            <Todo>срок изготовления</Todo> в зависимости от объёма и комплектации. Точный срок
            фиксируем в спецификации к договору.
          </p>

          <h2>Упаковка</h2>
          <p>
            Мебель отгружается в разобранном виде в заводской упаковке. Объём каждой позиции указан
            в карточке товара — по нему заранее считаем, сколько машин потребуется на партию.
          </p>

          <TodoBlock title="Что подтвердить перед запуском страницы">
            <ul>
              <li>Тарифы по Нижнему Новгороду и за пределами города</li>
              <li>Сумма заказа, с которой доставка бесплатна</li>
              <li>Сроки отгрузки со склада и сроки изготовления под заказ</li>
              <li>Список транспортных компаний, с которыми работаете</li>
              <li>Условия подъёма и сборки на объекте</li>
            </ul>
          </TodoBlock>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="cta-strip">
          <div>
            <h2>Посчитаем доставку под вашу партию</h2>
            <p>Пришлите список позиций и адрес объекта — вернёмся с расчётом и сроком.</p>
          </div>
          <div className="hero-actions">
            <RequestButton className="btn btn-copper">Рассчитать доставку</RequestButton>
            <Link className="btn btn-ghost" href="/payment">
              Условия оплаты
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
