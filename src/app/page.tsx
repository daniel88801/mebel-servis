import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { LeadForm } from "@/components/LeadForm";
import { PdConsentText } from "@/components/LegalConsent";
import { RequestButton } from "@/components/RequestModal";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import {
  advantages,
  categories,
  categoryCounts,
  products,
  productsByCategory,
  toCardData,
} from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Мебель-Сервис — производство мебели для объектов, Нижний Новгород",
  description:
    "Завод в Нижнем Новгороде: кровати по ГОСТ, металлические шкафы, мебель на каркасе и ЛДСП для казарм, общежитий, школ и гостиниц. Цех 4 000+ м².",
  path: "/",
  absoluteTitle: true,
});

/** По одной первой позиции из каждого раздела, максимум восемь. */
const hits = categories
  .map((cat) => productsByCategory(cat.id)[0])
  .filter(Boolean)
  .slice(0, 8)
  .map(toCardData);

/** Витрина первого экрана: одна крупная вырезка и лента мелких под ней. */
const showcase = ["beds", "lockers", "office", "students", "banquet", "safes"]
  .map((id) => productsByCategory(id)[0])
  .filter(Boolean);
const [lead, ...strip] = showcase;

/** Три типа объектов — фотографии из тех же съёмок, что и первый экран. */
const objects = [
  {
    src: "/images/hero/barracks.jpg",
    alt: "Казарма: двухъярусные кровати и шкафы",
    title: "Казармы и ведомственные объекты",
    note: "Кровати по ГОСТ, шкафы, тумбы, табуреты",
    href: "/catalog/army",
  },
  {
    src: "/images/hero/hostel.jpg",
    alt: "Комната общежития с двухъярусной кроватью",
    title: "Общежития и хостелы",
    note: "Комплектация комнаты под число мест",
    href: "/catalog/dorms",
  },
  {
    src: "/images/hero/classroom.jpg",
    alt: "Учебная аудитория со столами на металлокаркасе",
    title: "Учебные и социальные учреждения",
    note: "Столы и стулья на металлокаркасе",
    href: "/catalog/students",
  },
  {
    src: "/images/hero/hotel.jpg",
    alt: "Гостиничный номер с кроватью и шкафом",
    title: "Гостиницы",
    note: "Кровати, шкафы и столы из ЛДСП",
    href: "/catalog/hotels",
  },
] as const;

/** Разделы для списка направлений: самые объёмные по числу позиций. */
const bigCategories = [...categories]
  .filter((c) => c.id !== "sale")
  .sort((a, b) => (categoryCounts[b.id] ?? 0) - (categoryCounts[a.id] ?? 0))
  .slice(0, 6);

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <HeroSlideshow />
        <div className="hero-inner">
          <p className="kicker mono">Нижний Новгород · собственное производство</p>
          <h1>Мебель, которая выдерживает объект</h1>
          <div className="hero-actions">
            <Link className="btn btn-copper" href="/catalog">
              Открыть каталог
            </Link>
            <RequestButton className="btn btn-ghost-light">Заявка на поставку</RequestButton>
          </div>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-cell">
          <b>4 000+</b>
          <span>м² производственный комплекс</span>
        </div>
        <div className="stat-cell">
          <b>{products.length}</b>
          <span>позиций в каталоге</span>
        </div>
        <div className="stat-cell">
          <b>{categories.length}</b>
          <span>направлений по типам объектов</span>
        </div>
        <div className="stat-cell">
          <b>ГОСТ</b>
          <span>кровати по 2056-77</span>
        </div>
      </section>

      <section className="wordmark">
        <h2 className="wordmark-type">
          <span>Мебель</span>
          <span>Сервис</span>
        </h2>
        <div className="statement">
          <p>
            Производим мебель для объектов с интенсивной эксплуатацией: казармы, общежития,
            гостиницы, учебные и производственные помещения. Металл и ЛДСП, серийные партии,
            изготовление по техническому заданию.
          </p>
          <Link className="link-arrow mono" href="/about">
            О производстве
          </Link>
        </div>
        <div className="cutouts">
          {strip.map((p) => (
            <Link className="cutout" key={p.id} href={`/catalog/${p.category}`}>
              <Image
                src={p.image}
                alt={p.name}
                width={400}
                height={400}
                sizes="(max-width: 640px) 45vw, 20vw"
              />
              <span className="mono">{p.sku}</span>
            </Link>
          ))}
        </div>
      </section>

      <main id="content">
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
              {hits.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                  Объекты
                </p>
                <h2>Где стоит наша мебель</h2>
              </div>
              <p>
                Одни и те же изделия работают в казарме, общежитии и учебном классе — меняются
                комплектация и объём партии. Мебель не щадят: сменяемый состав, ежедневная
                нагрузка, перестановки и переезды.
              </p>
            </div>
            <div className="works">
              {objects.map((o) => (
                <Link className="work" key={o.src} href={o.href}>
                  <Image src={o.src} alt={o.alt} width={1200} height={800} sizes="(max-width: 900px) 100vw, 50vw" />
                  <div className="work-foot">
                    <div>
                      <b>{o.title}</b>
                      <span>{o.note}</span>
                    </div>
                    <span className="work-btn mono">Смотреть</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap split">
            <Image
              src="/images/production.jpg"
              alt="Сварка металлокаркаса полуавтоматом MIG"
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

        <section className="section">
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

        <section className="catalog-band">
          <div className="wrap">
            <div className="band-head">
              <h2>Направления</h2>
              <Link className="link-arrow mono" href="/catalog">
                Все {categories.length} разделов
              </Link>
            </div>
            <ol className="band-list">
              {bigCategories.map((cat, i) => (
                <li key={cat.id}>
                  <Link href={`/catalog/${cat.id}`}>
                    <span className="band-n mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="band-name">{cat.name}</span>
                    <span className="band-count mono">{categoryCounts[cat.id]}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section">
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
              <div className="hero-actions">
                <RequestButton className="btn btn-primary">Заявка на поставку</RequestButton>
              </div>
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
