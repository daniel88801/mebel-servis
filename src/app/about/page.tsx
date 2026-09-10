import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { PdConsentText } from "@/components/LegalConsent";
import { ClientIcons } from "@/components/ClientIcons";
import { categories, categoryCounts, company, products } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "О компании",
  description:
    "ООО «Мебель-Сервис» в Нижнем Новгороде: цех 4 000+ м², лазер, сварка, порошковая окраска и ЛДСП. Серийная мебель для казарм, общежитий, школ и гостиниц.",
  path: "/about",
});

const STAGES = [
  "Заготовка и раскрой металла",
  "Гибка и сварка каркасов",
  "Порошковая окраска",
  "Раскрой и кромление ЛДСП",
  "Сборка и комплектация",
  "Контроль и упаковка",
];

const PROCESS_SHOTS = [
  {
    src: "/images/production-laser.jpg",
    alt: "Лазерный раскрой листовой стали",
    title: "Раскрой",
    note: "оптоволоконный лазер",
  },
  {
    src: "/images/production.jpg",
    alt: "Сварка квадратной трубы металлокаркаса",
    title: "Сварка",
    note: "полуавтомат MIG",
  },
  {
    src: "/images/production-press.jpg",
    alt: "Гибка профильной трубы на прессе",
    title: "Гибка",
    note: "пресс и оснастка",
  },
  {
    src: "/images/production-beds.jpg",
    alt: "Зачистка сварного шва болгаркой",
    title: "Зачистка",
    note: "подготовка к окраске",
  },
] as const;

const CLIENTS = [
  {
    icon: ClientIcons.army,
    title: "Военные и ведомственные объекты",
    text: "Казармы и специальные учреждения. Отдельные позиции изготавливаем по ГОСТ.",
  },
  {
    icon: ClientIcons.dorms,
    title: "Общежития",
    text: "Комплексное оснащение комнат и общих зон: кровати, шкафы, тумбы, столы.",
  },
  {
    icon: ClientIcons.education,
    title: "Образовательные учреждения",
    text: "Мебель для учащихся, аудиторий, столовых и административных помещений.",
  },
  {
    icon: ClientIcons.social,
    title: "Социальные и медицинские учреждения",
    text: "Изделия для помещений с интенсивной эксплуатацией и санитарными требованиями.",
  },
  {
    icon: ClientIcons.industrial,
    title: "Промышленные предприятия",
    text: "Верстаки, стеллажи, шкафы для раздевалок, мебель для бытовок и рабочих.",
  },
  {
    icon: ClientIcons.hotels,
    title: "Гостиницы и хостелы",
    text: "Кровати, тумбы и корпусная мебель под серийное оснащение номерного фонда.",
  },
];

const ADVANTAGES = [
  {
    title: "Собственное производство",
    text: "Комплекс площадью более 4 000 м². Контролируем основные этапы изготовления и не зависим от сторонних производителей.",
  },
  {
    title: "Многолетний производственный опыт",
    text: "Практика работы с металлом, конструкциями и тентовой продукцией стала фундаментом мебельного направления.",
  },
  {
    title: "Крупные объёмы",
    text: "Мощности рассчитаны на серийные и оптовые заказы, включая комплексное оснащение объектов.",
  },
  {
    title: "Контроль качества",
    text: "Проверяем прочность конструкций, качество материалов, сборку и соответствие техническому заданию.",
  },
  {
    title: "Гибкость производства",
    text: "Адаптируем конструкцию, размеры и комплектацию под требования конкретного проекта.",
  },
  {
    title: "Конкурентная стоимость",
    text: "Производим сами, без наценок посредников. Выгодные условия для крупных заказчиков.",
  },
];

export default function AboutPage() {
  return (
    <main id="content">
      <div className="wrap page-hero">
        <p className="crumbs">
          <Link href="/">Главная</Link> / О компании
        </p>
        <h1>О компании</h1>
      </div>

      <section className="section" style={{ paddingTop: 4 }}>
        <div className="wrap split">
          <Image
            src="/images/production-beds.jpg"
            alt="Зачистка сварного шва болгаркой на металлокаркасе"
            width={1152}
            height={864}
            sizes="(max-width: 980px) 100vw, 50vw"
          />
          <div className="prose">
            <p className="mono" style={{ color: "var(--copper)" }}>
              Нижний Новгород
            </p>
            <h2>Производственная компания с собственной площадкой</h2>
            <p>
              ООО «Мебель-Сервис» — производитель металлической и корпусной мебели для объектов с
              интенсивной эксплуатацией. Собственный производственный комплекс площадью более 4 000
              м² в Нижнем Новгороде.
            </p>
            <p>
              Производственная база сформирована на многолетнем опыте работы с металлическими
              конструкциями и тентовой продукцией. Это позволяет уверенно работать с металлом,
              организовывать серийный выпуск и обеспечивать стабильное качество партии.
            </p>
            <p>
              Ориентированы на оптовые, комплексные и крупные серийные заказы. Изготавливаем как
              каталожные позиции, так и изделия по техническому заданию заказчика.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="stat-row">
          <div>
            <b>4 000+</b>
            <span>м² производственный комплекс</span>
          </div>
          <div>
            <b>{products.length}</b>
            <span>позиций в каталоге</span>
          </div>
          <div>
            <b>{categories.length}</b>
            <span>направлений по типам объектов</span>
          </div>
          <div>
            <b>Полный цикл</b>
            <span>от заготовки металла до упаковки</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                Продукция
              </p>
              <h2>Что мы производим</h2>
            </div>
            <p>
              Полный цикл и собственный участок металлообработки позволяют выпускать изделия,
              соответствующие требованиям заказчика: от заготовки и сварки каркаса до порошковой
              окраски, сборки и упаковки.
            </p>
          </div>

          <ul className="stage-line">
            {STAGES.map((stage, i) => (
              <li key={stage}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {stage}
              </li>
            ))}
          </ul>

          <ul className="process-shots">
            {PROCESS_SHOTS.map((shot) => (
              <li key={shot.src}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1152}
                  height={864}
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
                />
                <div className="process-shot-foot">
                  <b>{shot.title}</b>
                  <span>{shot.note}</span>
                </div>
              </li>
            ))}
          </ul>

          <ul className="nomen">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/catalog/${c.id}`}
                  className={c.id === "sale" ? "nomen-sale" : undefined}
                >
                  <span>
                    {c.name}
                    {c.id === "sale" && (
                      <span className="badge badge-sale nomen-sale-mark">Акция</span>
                    )}
                  </span>
                  <span className="nomen-count">{categoryCounts[c.id]}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="quality-note">
            Изделия проверяем на ключевых этапах: прочность конструкций, качество материалов, сборка
            и соответствие техническому заданию. Отдельные позиции изготавливаем по ГОСТ.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                Кому поставляем
              </p>
              <h2>Объекты, которые оснащаем</h2>
            </div>
            <p>
              Работаем и с отдельными позициями, и с комплексным оснащением объекта под ключ — от
              спецификации до графика отгрузки партиями.
            </p>
          </div>
          <div className="clients-grid">
            {CLIENTS.map((c) => (
              <article className="client-card" key={c.title}>
                <span className="client-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="adv adv-photo">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="mono" style={{ color: "var(--copper)", marginBottom: 8 }}>
                Почему мы
              </p>
              <h2>Преимущества</h2>
            </div>
          </div>
          <div className="adv-cards">
            {ADVANTAGES.map((a) => (
              <article className="adv-card" key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap home-lead">
          <div>
            <p className="mono" style={{ color: "var(--copper)" }}>
              Вопросы
            </p>
            <h2 style={{ fontSize: "2rem", letterSpacing: "-0.03em", margin: "8px 0 12px" }}>
              Остались вопросы по производству?
            </h2>
            <p>
              Расскажем о возможностях под ваш объект, посчитаем партию и подготовим коммерческое
              предложение с учётом сроков и адаптации изделий.
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
            submitLabel="Отправить вопрос"
            okText="Вопрос принят. Ответим в рабочее время."
            consent={<PdConsentText />}
          />
        </div>
      </section>
    </main>
  );
}
