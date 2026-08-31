import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/ACER/mebel";
const IMG_DIR = path.join(ROOT, "images", "catalog");
fs.mkdirSync(IMG_DIR, { recursive: true });

const CATEGORIES = [
  { id: "army", name: "Армейская мебель", url: "https://www.metmebel.ru/catalog/armeyskaya-mebel/?SHOWALL_1=1" },
  { id: "beds", name: "Металлические кровати", url: "https://www.metmebel.ru/catalog/metallicheskie-krovati/?SHOWALL_1=1" },
  { id: "frame", name: "Мебель на металлокаркасе", url: "https://www.metmebel.ru/catalog/mebel-na-metallokarkase/?SHOWALL_1=1" },
  { id: "folding", name: "Раскладная мебель ЛДСП", url: "https://www.metmebel.ru/catalog/raskladnaya-mebel-ldsp/?SHOWALL_1=1" },
  { id: "students", name: "Мебель для учащихся", url: "https://www.metmebel.ru/catalog/auditornaya-mebel/?SHOWALL_1=1" },
  { id: "workers", name: "Мебель для рабочих и строителей", url: "https://www.metmebel.ru/catalog/mebel-dlya-rabochikh-i-stroiteley/?SHOWALL_1=1" },
  { id: "dorms", name: "Мебель для общежитий", url: "https://www.metmebel.ru/catalog/mebel-dlya-obshchezhitiy/?SHOWALL_1=1" },
];

const WORKER_FALLBACKS = [
  "https://www.metmebel.ru/catalog/mebel-dlya-rabochikh-i-stroiteley/?SHOWALL_1=1",
  "https://www.metmebel.ru/catalog/mebel-dlya-stroiteley/?SHOWALL_1=1",
  "https://www.metmebel.ru/catalog/mebel-dlya-bytovok/?SHOWALL_1=1",
  "https://www.metmebel.ru/catalog/krovati-dlya-rabochikh/?SHOWALL_1=1",
];

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
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
        res.on("end", () => resolve({ status: res.statusCode, url, body: Buffer.concat(chunks) }));
      }
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout " + url)));
  });
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
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
    const imgM = block.match(/<img[^>]+src="(\/upload\/iblock\/[^"]+)"[^>]*(?:alt|title)="([^"]*)"/i);
    const titleM = block.match(
      /class="title-products"\s+href="(\/catalog\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/i
    );
    if (!titleM) continue;
    const inner = titleM[2];
    const skuM = inner.match(/\[([^\]]+)\]/);
    const name = decode(inner.replace(/<[^>]+>/g, " "))
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const sku = skuM ? decode(skuM[1]).trim() : "";
    const href = titleM[1];
    const price = parsePrice(block);
    const colors = [
      ...block.matchAll(
        />(Дуб сонома|Венге|Ольха(?: \([^)]+\))?|Белый|Орех Ноче Экко(?: \([^)]+\))?|Серый|Бук|Графит)</g
      ),
    ].map((x) => x[1]);
    const badge = /Лидер продаж/i.test(block)
      ? "Лидер"
      : /Новинка/i.test(block)
        ? "Новинка"
        : /На заказ/i.test(block)
          ? "На заказ"
          : "";
    const img = imgM ? imgM[1] : "";
    items.push({
      id: `${category}-${slugify(sku || name)}-${items.length + 1}`,
      sku: sku || "",
      name,
      category,
      price,
      sourceImage: img ? "https://www.metmebel.ru" + img.replace(/ /g, "%20") : "",
      href: "https://www.metmebel.ru" + href,
      colors: [...new Set(colors)],
      badge,
    });
  }
  return items;
}

function decode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\\\+"/g, '"');
}

async function downloadImage(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) return dest;
  const { status, body } = await get(url);
  if (status !== 200 || body.length < 500) throw new Error("img " + status + " " + url);
  fs.writeFileSync(dest, body);
  return dest;
}

async function scrapeCategory(cat) {
  let urls = [cat.url];
  if (cat.id === "workers") urls = [cat.url, ...WORKER_FALLBACKS];
  for (const url of urls) {
    const { status, body } = await get(url);
    const html = body.toString("utf8");
    const countMatch = html.match(/ИЗ\s+\*\*?(\d+)/i) || html.match(/ИЗ\s+<\/?[a-z]+[^>]*>\s*(\d+)/i) || html.match(/ИЗ\s+(\d+)/i);
    const products = parseProducts(html, cat.id);
    console.log(cat.id, url, "status", status, "parsed", products.length, "shown", countMatch && countMatch[1]);
    if (products.length > 0) return { ...cat, products, source: url };
  }
  return { ...cat, products: [], source: cat.url };
}

function jsString(s) {
  return JSON.stringify(s);
}

async function main() {
  const cats = [];
  for (const cat of CATEGORIES) {
    cats.push(await scrapeCategory(cat));
  }

  const products = [];
  for (const cat of cats) {
    for (const p of cat.products) {
      const ext = path.extname(new URL(p.sourceImage).pathname) || ".jpg";
      const file = `${p.id}${ext}`.replace(/[^\w.\-]+/g, "-");
      const dest = path.join(IMG_DIR, file);
      try {
        await downloadImage(p.sourceImage, dest);
        p.image = "images/catalog/" + file;
      } catch (e) {
        console.log("img fail", p.id, e.message);
        p.image = p.sourceImage || "images/9.jpg";
      }
      products.push(p);
    }
  }

  const dataPath = path.join(ROOT, "js", "data.js");
  const existing = fs.readFileSync(dataPath, "utf8");
  const companyMatch = existing.match(/MS\.company = \{[\s\S]*?\n\};/);
  const catCover = {
    army: "images/8.jpg",
    beds: "images/11.jpg",
    frame: "images/3.jpg",
    folding: "images/7.jpg",
    students: "images/4.jpg",
    workers: "images/5.jpg",
    dorms: "images/6.jpg",
  };
  const catText = {
    army: "Мебель для казарм, ведомственных объектов и специальных учреждений. Изготавливаем по ГОСТам и техническому заданию заказчика.",
    beds: "Сварные и сборно-разборные кровати с порошковым покрытием. Для общежитий, казарм, хостелов и бытовок.",
    frame: "Столы, стулья и табуреты на стальном каркасе с элементами из ЛДСП. Рассчитаны на длительную интенсивную эксплуатацию.",
    folding: "Складные столы и скамьи из ЛДСП на металлических опорах. Для столовых, мероприятий и объектов с переменной нагрузкой.",
    students: "Ученические столы и стулья, в том числе регулируемые по высоте. Для школ, колледжей и учебных центров.",
    workers: "Практичный комплект для строительных городков, бытовок и вахтовых общежитий: кровати, тумбы, столы, шкафы.",
    dorms: "Кровати, шкафы, тумбы и столы для студенческих и рабочих общежитий. Серийные партии и поставка под проект.",
  };
  const catShort = {
    army: "По приказам МО РФ № 333 и № 120",
    beds: "Одноярусные и двухъярусные",
    frame: "Металл + ЛДСП",
    folding: "Столы и скамьи",
    students: "Аудиторные столы и стулья",
    workers: "Бытовки и вахтовые объекты",
    dorms: "Комплексное оснащение комнат",
  };

  const catJs = cats
    .map((c) => {
      return `  {
    id: ${jsString(c.id)},
    name: ${jsString(c.name)},
    short: ${jsString(catShort[c.id])},
    image: ${jsString(catCover[c.id])},
    text: ${jsString(catText[c.id])},
  }`;
    })
    .join(",\n");

  const prodJs = products
    .map((p) => {
      const lines = [
        `    id: ${jsString(p.id)}`,
        `    sku: ${jsString(p.sku)}`,
        `    name: ${jsString(p.name)}`,
        `    category: ${jsString(p.category)}`,
        p.price == null ? `    price: null` : `    price: ${p.price}`,
        `    image: ${jsString(p.image)}`,
      ];
      if (p.badge) lines.push(`    badge: ${jsString(p.badge)}`);
      if (p.colors && p.colors.length) lines.push(`    colors: ${JSON.stringify(p.colors)}`);
      return `  {\n${lines.join(",\n")}\n  }`;
    })
    .join(",\n");

  const out = `window.MS = window.MS || {};

${companyMatch[0]}

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

  fs.writeFileSync(dataPath, out);
  const summary = {};
  for (const p of products) summary[p.category] = (summary[p.category] || 0) + 1;
  const noPrice = products.filter((p) => p.price == null).length;
  console.log("TOTAL", products.length, summary, "noPrice", noPrice);
  fs.writeFileSync(path.join(ROOT, "scripts", "scrape-summary.json"), JSON.stringify({ total: products.length, summary, noPrice }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
