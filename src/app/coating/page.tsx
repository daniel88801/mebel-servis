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
          <p className="note">Фиксированного прайса нет: считаем по смете под конкретную партию.</p>
        </article>
        <article className="info-card">
          <p className="mono">02 · Производство</p>
          <h2>Тот же цех, что и мебель</h2>
          <p>
            Участок стоит на производстве {company.address}. Порошковое покрытие уже используется на
            собственных кроватях, шкафах и каркасах.
          </p>
          <p className="note">Камера 6000 × 1000 × 1500 мм — это предельный габарит детали.</p>
        </article>
        <article className="info-card">
          <p className="mono">03 · Срок</p>
          <h2>Считаем по объёму</h2>
          <p>
            Как и мебель под заказ, срок окраски зависит от объёма партии. Дни <Todo>от и до</Todo>{" "}
            называем после заявки.
          </p>
          <p className="note">Цвет любой по RAL — под заказ доступна вся палитра.</p>
        </article>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="split">
          {/* TODO: заменить на съёмку своей покрасочной камеры в работе —
              здесь кадр цеха, камера с подвесами слева. */}
          <Image
            src="/images/2.jpg"
            alt="Покрасочная камера с подвесами в цехе"
            width={1280}
            height={720}
            sizes="(max-width: 980px) 100vw, 50vw"
          />
          <div className="text-page prose">
            <h2>Как заказать</h2>
            <p>
              Пришлите чертёж или список изделий: металл, габарит, количество и желаемый цвет.
              Вернём расчёт по смете. Оплата и отгрузка — как у мебели: предоплата 50% для юрлиц,
              самовывоз или транспортная компания.
            </p>
            <p>
              <strong>Работаем с давальческим сырьём.</strong> Привозите свои изделия — покрасим и
              вернём. Детали должны проходить в камеру 6000 × 1000 × 1500 мм.
            </p>
            <p>
              Цвет — любой по каталогу RAL. Редкие оттенки заказываем под партию, это влияет на
              срок, но не ограничивает выбор.
            </p>
            <p>
              Режим: {company.hours}. Телефон {company.phones[0]}.
            </p>
            <TodoBlock title="Что ещё не закрыто по окраске">
              <ul>
                <li>Срок в днях: от и до, и от чего ещё зависит, кроме объёма</li>
                <li>Предельный вес детали — габарит камеры известен, вес нет</li>
                <li>Фотография своей покрасочной камеры в работе вместо общего кадра цеха</li>
                <li>Форма предварительного расчёта на сайте, если она нужна</li>
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
