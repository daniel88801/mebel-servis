import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { LeadForm } from "@/components/LeadForm";
import { PdConsentText } from "@/components/LegalConsent";
import { RequestButton } from "@/components/RequestModal";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { advantages, categories, productsByCategory, toCardData } from "@/data/catalog";

/** По одной первой позиции из каждого раздела, максимум восемь. */
const hits = categories
  .map((cat) => productsByCategory(cat.id)[0])
  .filter(Boolean)
  .slice(0, 8)
  .map(toCardData);

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <HeroSlideshow />
        <div className="hero-inner">
          <p className="kicker mono">Нижний Новгород · собственное производство</p>
          <h1>Мебель, которая выдерживает объект</h1>
          <p className="lead">
            Наша задача — создавать надежную мебель там, где важны не громкие обещания, а качество,
            стабильность и способность производителя выполнить поставленную задачу.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-copper" href="/catalog">
              Открыть каталог
            </Link>
            <RequestButton className="btn btn-ghost-light">Заявка на поставку</RequestButton>
          </div>
          <div className="hero-stats">
            <div>
              <b>4 000+</b>
              <span>м² производственный комплекс</span>
            </div>
            <div>
              <b>19</b>
              <span>разделов каталога</span>
            </div>
            <div>
              <b>опт</b>
              <span>серийные и комплексные заказы</span>
            </div>
          </div>
        </div>
      </section>

      <main id="content">
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                  Каталог
                </p>
                <h2>Полный каталог по объектам</h2>
              </div>
              <p>
                От единичного изделия до оснащения крупного объекта — производим, контролируем и
                отвечаем за результат.
              </p>
            </div>
            <div className="cats">
              {categories.map((cat) => (
                <Link
                  className={`cat${cat.id === "sale" ? " cat-sale" : ""}`}
                  key={cat.id}
                  href={`/catalog/${cat.id}`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
                  />
                  {cat.id === "sale" && <span className="badge badge-sale">Распродажа</span>}
                  <div className="cat-body">
                    <span className="mono">{cat.short}</span>
                    <h3>{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap split">
            <Image
              src="/images/production.jpg"
              alt="Металлообработка и корпусное производство"
              width={1152}
              height={864}
              sizes="(max-width: 980px) 100vw, 50vw"
            />
            <div>
              <p className="mono" style={{ color: "var(--copper)" }}>
                Производитель
              </p>
              <h2>Собственное производство — ключевое преимущество</h2>
              <p>
                ООО «Мебель-Сервис» — производственная компания из Нижнего Новгорода. Работаем с
                металлом и ЛДСП, изготавливаем металлокаркасы, собираем и контролируем готовые
                изделия.
              </p>
              <p>
                Ориентированы на оптовые, комплексные и крупные серийные заказы: военные и
                ведомственные объекты, общежития, образовательные и социальные учреждения,
                промышленные и административные помещения.
              </p>
              <div className="facts">
                <div className="fact">
                  <b>Полный цикл</b>
                  <span>от заготовки до сборки</span>
                </div>
                <div className="fact">
                  <b>По ТЗ</b>
                  <span>размеры, комплектация, декор</span>
                </div>
                <div className="fact">
                  <b>Металл + ЛДСП</b>
                  <span>каркасы, корпуса, кровати</span>
                </div>
                <div className="fact">
                  <b>Крупные партии</b>
                  <span>единые требования к серии</span>
                </div>
              </div>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/about">
                  О компании
                </Link>
                <Link className="btn btn-ghost" href="/contacts">
                  Реквизиты
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section adv">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                  Почему мы
                </p>
                <h2>Производитель, который закрывает большие задачи</h2>
              </div>
              <p>
                Понимаем специфику крупных поставок. Работаем и с отдельными позициями, и с
                комплексным оснащением объектов.
              </p>
            </div>
            <div className="adv-grid">
              {advantages.map((a, i) => (
                <div className="adv-item" key={a.t}>
                  <div className="mono n">0{i + 1}</div>
                  <h3>{a.t}</h3>
                  <p>{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                  Позиции
                </p>
                <h2>Что заказывают чаще всего</h2>
              </div>
              <Link className="btn btn-ghost" href="/catalog">
                Весь каталог
              </Link>
            </div>
            <div className="grid-4">
              {hits.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap home-lead">
            <div>
              <p className="mono" style={{ color: "var(--copper)" }}>
                Заявка
              </p>
              <h2 style={{ fontSize: "2rem", letterSpacing: "-0.03em", margin: "8px 0 12px" }}>
                Пришлите ТЗ — посчитаем партию
              </h2>
              <p>
                Для оптовых и комплексных заказов готовим коммерческое предложение с учётом объёма,
                сроков и адаптации изделий.
              </p>
              <p style={{ marginTop: 12, color: "var(--ink-2)" }}>
                Телефон:{" "}
                <a href="tel:+79200050110">
                  <strong>+7 (920) 005-01-10</strong>
                </a>
                <br />
                Почта: <a href="mailto:m1-mebelservis-nn@mail.ru">m1-mebelservis-nn@mail.ru</a>
              </p>
            </div>
            <LeadForm
              variant="home"
              className="form-card form-grid"
              submitLabel="Отправить заявку"
              okText="Заявка принята. Свяжемся с вами в рабочее время."
              consent={<PdConsentText />}
            />
          </div>
        </section>
      </main>
    </>
  );
}
