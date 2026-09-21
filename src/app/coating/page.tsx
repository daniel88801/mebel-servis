import Link from "next/link";
import Image from "next/image";
import { Todo, TodoBlock } from "@/components/Todo";
import { RequestButton } from "@/components/RequestModal";
import { company } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Порошковая окраска",
  description:
    "Услуга порошковой окраски металла на производстве ООО «Мебель-Сервис» в Нижнем Новгороде, наравне с изготовлением мебели. Расчёт по заявке.",
  path: "/coating",
});

export default function CoatingPage() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / Порошковая окраска
        </p>
        <h1>Порошковая окраска</h1>
        <p style={{ maxWidth: "62ch", marginTop: 10, color: "var(--ink-2)" }}>
          Второе направление производства, наравне с мебелью. Окрашиваем металлические изделия
          порошковой краской на своём цехе в Нижнем Новгороде. Услугу можно заказать отдельно от
          поставки мебели.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="mono">01 · Услуга</p>
          <h2>Окрашивание металла</h2>
          <p>
            Принимаем заказ на порошковую окраску. Состав партии, цвет и срок считаем по вашей
            заявке: что красим, сколько и в какой цвет.
          </p>
          <p className="note">
            Тариф: <Todo>за изделие, за м² или по смете</Todo>.
          </p>
        </article>
        <article className="info-card">
          <p className="mono">02 · Производство</p>
          <h2>Тот же цех, что и мебель</h2>
          <p>
            Участок стоит на производстве {company.address}. Порошковое покрытие уже используется
            на собственных кроватях, шкафах и каркасах.
          </p>
          <p className="note">
            Максимальный габарит детали: <Todo>длина, ширина, вес</Todo>.
          </p>
        </article>
        <article className="info-card">
          <p className="mono">03 · Срок</p>
          <h2>Считаем по объёму</h2>
          <p>
            Как и мебель под заказ, срок окраски зависит от объёма партии. Дни{" "}
            <Todo>от и до</Todo> называем после заявки.
          </p>
          <p className="note">
            Палитра: <Todo>какие цвета и RAL</Todo>.
          </p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="split">
          <Image
            src="/images/production-beds.jpg"
            alt="Зачистка сварного шва перед окраской"
            width={1152}
            height={864}
            sizes="(max-width: 980px) 100vw, 50vw"
          />
          <div className="text-page prose">
            <h2>Как заказать</h2>
            <p>
              Пришлите чертёж или список изделий: металл, габарит, количество и желаемый цвет.
              Вернём расчёт. Оплата и отгрузка — как у мебели: предоплата 50% для юрлиц, самовывоз
              или транспортная компания.
            </p>
            <p>
              Режим: {company.hours}. Телефон {company.phones[0]}.
            </p>
            <TodoBlock title="Что ещё не закрыто по окраске">
              <ul>
                <li>Тариф: за изделие, за квадратный метр или только по смете</li>
                <li>Максимальные габарит и вес детали</li>
                <li>Срок в днях и от чего он ещё зависит, кроме объёма</li>
                <li>Доступные цвета</li>
                <li>Берёте ли давальческие изделия заказчика или только свои детали</li>
              </ul>
            </TodoBlock>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="cta-strip">
          <div>
            <h2>Посчитаем окраску отдельной заявкой</h2>
            <p>Пришлите габарит, количество и цвет — вернёмся с расчётом.</p>
          </div>
          <div className="hero-actions">
            <RequestButton className="btn btn-copper">Заявка на окраску</RequestButton>
            <Link className="btn btn-ghost" href="/catalog">
              Каталог мебели
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
