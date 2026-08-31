import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/ACER/mebel";
const IMG_DIR = path.join(ROOT, "images", "catalog");
fs.mkdirSync(IMG_DIR, { recursive: true });

const CATEGORIES = [
  { id: "sale", name: "Распродажа", short: "Сниженные цены", slug: "rasprodazha", text: "Позиции по сниженной стоимости. Наличие и цену подтверждаем при заявке." },
  { id: "army", name: "Армейская мебель", short: "Приказы МО РФ № 333 и № 120", slug: "armeyskaya-mebel", text: "Мебель для казарм, ведомственных объектов и специальных учреждений." },
  { id: "beds", name: "Металлические кровати", short: "Одноярусные и двухъярусные", slug: "metallicheskie-krovati", text: "Сварные и сборно-разборные кровати с порошковым покрытием." },
  { id: "corpus", name: "Корпусная мебель из ЛДСП", short: "Шкафы, тумбы, столы", slug: "korpusnaya-mebel", text: "Корпусная мебель из ЛДСП для объектов и общежитий." },
  { id: "frame", name: "Мебель на металлокаркасе", short: "Металл + ЛДСП", slug: "mebel-na-metallokarkase", text: "Столы, стулья и табуреты на стальном каркасе с элементами из ЛДСП." },
  { id: "folding", name: "Раскладная мебель ЛДСП", short: "Столы и скамьи", slug: "raskladnaya-mebel-ldsp", text: "Складные столы и скамьи из ЛДСП на металлических опорах." },
  { id: "plastic", name: "Раскладная пластиковая мебель", short: "Столы, стулья, скамьи", slug: "raskladnaya-mebel", text: "Складная пластиковая мебель для мероприятий, столовых и временных объектов." },
  { id: "covers", name: "Чехлы", short: "Для складной мебели", slug: "chekhly", text: "Чехлы для переноски и хранения складной мебели." },
  { id: "office", name: "Офисная мебель", short: "Кабинеты и персонал", slug: "ofisnaya-mebel", text: "Офисные столы, шкафы и тумбы для административных помещений." },
  { id: "students", name: "Мебель для учащихся", short: "Аудиторные столы и стулья", slug: "auditornaya-mebel", text: "Ученические столы и стулья, в том числе регулируемые по высоте." },
  { id: "lockers", name: "Шкафы металлические", short: "Хранение и раздевалки", slug: "shkafy-metallicheskie", text: "Металлические шкафы для одежды, имущества и инвентаря." },
  { id: "bedding", name: "Постельные принадлежности", short: "Матрасы и текстиль", slug: "postelnye-prinadlezhnosti", text: "Матрасы и постельные принадлежности для общежитий и объектов." },
  { id: "hotels", name: "Мебель для гостиниц и хостелов", short: "Номера и холлы", slug: "mebel-dlya-gostinits-i-khostelov", text: "Комплекты для гостиниц, хостелов и мини-отелей." },
  { id: "workers", name: "Мебель для рабочих и строителей", short: "Бытовки и вахта", slug: "mebel-dlya-rabochikh-i-stroiteley", text: "Мебель для строительных городков, бытовок и вахтовых общежитий." },
  { id: "dorms", name: "Мебель для общежитий", short: "Комнаты и кухни", slug: "mebel-dlya-obshchezhitiy", text: "Кровати, шкафы, тумбы и столы для общежитий." },
  { id: "industrial", name: "Производственная мебель", short: "Цех и склад", slug: "proizvodstvennaya-mebel", text: "Мебель для производственных и складских помещений." },
  { id: "banquet", name: "Мебель для банкетов", short: "Залы и мероприятия", slug: "mebel-dlya-banketa", text: "Банкетные столы, стулья и скамьи." },
  { id: "medical", name: "Медицинская мебель", short: "Палаты и кабинеты", slug: "medicinskaya-mebel", text: "Мебель для медицинских учреждений и палат." },
  { id: "safes", name: "Сейфы", short: "Хранение ценностей", slug: "seyfy", text: "Сейфы для документов и ценностей." },
];

const COVER = {
  sale: "images/7.jpg",
  army: "images/8.jpg",
  beds: "images/11.jpg",
  corpus: "images/6.jpg",
  frame: "images/3.jpg",
  folding: "images/7.jpg",
  plastic: "images/7.jpg",
  covers: "images/18.jpg",
  office: "images/26.jpg",
  students: "images/4.jpg",
  lockers: "images/25.jpg",
  bedding: "images/13.jpg",
  hotels: "images/6.jpg",
  workers: "images/5.jpg",
  dorms: "images/6.jpg",
  industrial: "images/5.jpg",
  banquet: "images/3.jpg",
  medical: "images/9.jpg",
  safes: "images/25.jpg",
};

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,image/avif,image/webp,*/*",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          get(next).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      }
    );
    req.on("error", reject);
    req.setTimeout(40000, () => req.destroy(new Error("timeout " + url)));
  });
}

function decode(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function parsePrice(text) {
  const m = String(text).replace(/\s/g, " ").match(/(\d[\d\s]{2,})\s*руб/i);
  if (!m) return null;
  const n = Number(m[1].replace(/\s/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseProducts(html, category) {
  const items = [];
  const blocks = html.split(/<li class="wrap[^"]*">/);
  for (const block of blocks.slice(1)) {
    const imgM = block.match(/<img[^>]+src="(\/upload\/iblock\/[^"]+)"/i);
    const titleM = block.match(/class="title-products"\s+href="(\/catalog\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleM) continue;
    const inner = titleM[2];
    const skuM = inner.match(/\[([^\]]+)\]/);
    const name = decode(inner.replace(/<[^>]+>/g, " "))
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const sku = skuM ? decode(skuM[1]).trim() : "";
    const price = parsePrice(block);
    const colors = [
      ...block.matchAll(
        />(Дуб сонома|Венге|Ольха(?: \([^)]+\))?|Белый|Орех Ноче Экко(?: \([^)]+\))?|Серый|Бук|Графит|Черный|Красный|Синий|Зеленый|Бежевый)</g
      ),
    ].map((x) => x[1]);
    const badge = /Лидер продаж/i.test(block)
      ? "Лидер"
      : /Новинка/i.test(block)
        ? "Новинка"
        : /На заказ/i.test(block)
          ? "На заказ"
          : /акция|спецпредлож/i.test(block)
            ? "Акция"
            : "";
    const img = imgM ? imgM[1] : "";
    items.push({
      id: `${category}-${slugify(sku || name)}-${items.length + 1}`,
      sku,
      name,
      category,
      price,
      sourceImage: img ? "https://www.metmebel.ru" + img.replace(/ /g, "%20") : "",
      href: "https://www.metmebel.ru" + titleM[1],
      colors: [...new Set(colors)],
      badge,
    });
  }
  return items;
}

function stripHtml(s) {
  return decode(String(s).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseDims(raw) {
  if (!raw) return {};
  const parts = String(raw)
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/[×х]/g, "x")
    .split("x")
    .map((p) => parseFloat(String(p).split("/")[0]));
  const length = Number.isFinite(parts[0]) ? parts[0] : null;
  const width = Number.isFinite(parts[1]) ? parts[1] : null;
  const height = Number.isFinite(parts[2]) ? parts[2] : null;
  return { length, width, height };
}

function parseDetails(html) {
  const sizeM =
    html.match(/Размеры \(ДхШхВ\)[\s\S]{0,280}?<dd>[\s\S]{0,120}?>([0-9.,\/хxХ\s]+)/i) ||
    html.match(/Габаритные размеры \(ДхШхВ\):\s*([0-9.,\/хxХ\s]+)\s*мм/i);
  const materialM = html.match(/<dt><span>Материал<\/span><\/dt>\s*<dd><span[^>]*>([^<]+)/i);
  const colorM = html.match(/class="color_val">([^<]+)/i) || html.match(/<dt><span>Цвет<\/span><\/dt>\s*<dd>[\s\S]{0,80}?>([^<]+)/i);
  const descM = html.match(/itemprop="description">([\s\S]*?)<\/div>/i);
  const diamM = html.match(/Диаметр[\s\S]{0,120}?>([0-9.,]+)/i);
  const sizes = sizeM ? sizeM[1].replace(/\s+/g, "").replace(/x/gi, "х") : "";
  const dims = parseDims(sizes);
  return {
    sizes: sizes || "",
    material: materialM ? decode(materialM[1]).trim() : "",
    color: colorM ? decode(colorM[1]).trim() : "",
    desc: descM ? stripHtml(descM[1]).slice(0, 900) : "",
    diameter: diamM ? parseFloat(diamM[1].replace(",", ".")) : null,
    ...dims,
  };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function downloadImage(url, dest) {
  if (!url) return false;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1500) return true;
  const { status, body } = await get(url);
  if (status !== 200 || body.length < 400) return false;
  fs.writeFileSync(dest, body);
  return true;
}

function jsString(s) {
  return JSON.stringify(s == null ? "" : s);
}

async function main() {
  const cats = [];
  for (const cat of CATEGORIES) {
    const url = `https://www.metmebel.ru/catalog/${cat.slug}/?SHOWALL_1=1`;
    const { status, body } = await get(url);
    const html = body.toString("utf8");
    const products = parseProducts(html, cat.id);
    console.log(cat.id, status, products.length);
    cats.push({ ...cat, products });
  }

  const products = cats.flatMap((c) => c.products);
  console.log("listing", products.length);

  await mapLimit(products, 8, async (p) => {
    const ext = path.extname(new URL(p.sourceImage || "https://x/a.jpg").pathname) || ".jpg";
    const file = `${p.id}${ext}`.replace(/[^\w.\-]+/g, "-");
    const dest = path.join(IMG_DIR, file);
    try {
      const ok = await downloadImage(p.sourceImage, dest);
      p.image = ok ? "images/catalog/" + file : p.sourceImage || "images/9.jpg";
    } catch {
      p.image = p.sourceImage || "images/9.jpg";
    }
  });
  console.log("images done");

  let detailsOk = 0;
  await mapLimit(products, 6, async (p) => {
    try {
      const { status, body } = await get(p.href);
      if (status !== 200) return;
      const d = parseDetails(body.toString("utf8"));
      p.sizes = d.sizes;
      p.material = d.material;
      p.desc = d.desc;
      p.length = d.length;
      p.width = d.width;
      p.height = d.height;
      p.diameter = d.diameter;
      if (d.color && !(p.colors || []).includes(d.color)) p.colors = [...(p.colors || []), d.color];
      detailsOk++;
    } catch (e) {
      /* skip */
    }
  });
  console.log("details", detailsOk, "/", products.length);

  const catJs = CATEGORIES.map(
    (c) => `  {
    id: ${jsString(c.id)},
    name: ${jsString(c.name)},
    short: ${jsString(c.short)},
    image: ${jsString(COVER[c.id])},
    text: ${jsString(c.text)},
  }`
  ).join(",\n");

  const prodJs = products
    .map((p) => {
      const lines = [
        `    id: ${jsString(p.id)}`,
        `    sku: ${jsString(p.sku)}`,
        `    name: ${jsString(p.name)}`,
        `    category: ${jsString(p.category)}`,
        p.price == null ? "    price: null" : `    price: ${p.price}`,
        `    image: ${jsString(p.image)}`,
      ];
      if (p.badge) lines.push(`    badge: ${jsString(p.badge)}`);
      if (p.sizes) lines.push(`    sizes: ${jsString(p.sizes)}`);
      if (p.material) lines.push(`    material: ${jsString(p.material)}`);
      if (p.desc) lines.push(`    desc: ${jsString(p.desc)}`);
      if (p.colors && p.colors.length) lines.push(`    colors: ${JSON.stringify(p.colors)}`);
      if (p.length) lines.push(`    length: ${p.length}`);
      if (p.width) lines.push(`    width: ${p.width}`);
      if (p.height) lines.push(`    height: ${p.height}`);
      if (p.diameter) lines.push(`    diameter: ${p.diameter}`);
      return `  {\n${lines.join(",\n")}\n  }`;
    })
    .join(",\n");

  const out = `window.MS = window.MS || {};

MS.company = {
  name: "Мебель-Сервис",
  legal: "ООО «Мебель-Сервис»",
  city: "Нижний Новгород",
  address: "603116, Нижний Новгород, ул. Гордеевская, 139Б",
  phones: ["+7 (920) 005-01-10", "+7 (930) 811-73-95"],
  email: "m1-mebelservis-nn@mail.ru",
  hours: "Пн–Пт 9:00–17:00",
  inn: "5257204453",
  kpp: "525701001",
  ogrn: "1215200033003",
  rs: "40702810542000048271",
  bank: "ПАО Сбербанк",
  ks: "30101810900000000603",
  bik: "042202603",
};

MS.categories = [
${catJs}
];

MS.products = [
${prodJs}
];

MS.advantages = [
  {
    t: "Собственное производство",
    d: "Комплекс площадью более 4 000 м². Контролируем основные этапы изготовления и не зависим от сторонних производителей.",
  },
  {
    t: "Многолетний опыт",
    d: "Практический опыт работы с металлом, конструкциями и тентовой продукцией стал фундаментом мебельного направления.",
  },
  {
    t: "Крупные объемы",
    d: "Работаем с серийными и оптовыми заказами, в том числе в рамках комплексного оснащения объектов.",
  },
  {
    t: "Контроль качества",
    d: "Проверяем прочность конструкций, материалы, сборку и соответствие техническим требованиям на ключевых этапах.",
  },
  {
    t: "Гибкость",
    d: "Адаптируем конструкцию, размеры и комплектацию под техническое задание конкретного проекта.",
  },
  {
    t: "Конкурентная стоимость",
    d: "Производим сами, без лишних посредников. Выгодные условия для крупных заказчиков.",
  },
];
`;

  fs.writeFileSync(path.join(ROOT, "js", "data.js"), out);
  const summary = {};
  for (const p of products) summary[p.category] = (summary[p.category] || 0) + 1;
  console.log("TOTAL", products.length, summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
