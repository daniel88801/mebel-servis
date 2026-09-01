/**
 * Вытаскивает характеристики из текстового поля `desc` в отдельные поля товара.
 *
 * Исходный каталог хранит вес, объём, нагрузку, покрытие, гарантию и страну
 * одной строкой описания — по ним нельзя ни фильтровать, ни строить таблицу.
 * Скрипт идемпотентен: считает всё заново из `desc` и перезаписывает поля.
 *
 *   node scripts/enrich-catalog.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../src/data/catalog.json", import.meta.url);
const dry = process.argv.includes("--dry");

/** Разбирает описание в пары «ключ → значение», включая случай, когда значение на следующей строке. */
function pairs(desc) {
  const lines = String(desc || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([^:]{2,60}?)\s*:\s*(.*)$/);
    if (!m) continue;
    let [, key, value] = m;
    if (!value && lines[i + 1] && !lines[i + 1].includes(":")) value = lines[++i];
    if (value) out.push([key.toLowerCase().trim(), value.trim().replace(/[.;]+$/, "")]);
  }
  return out;
}

function num(value) {
  const m = String(value).match(/-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Первое значение, чей ключ подходит под предикат. */
function pick(list, match) {
  const hit = list.find(([k]) => match(k));
  return hit ? hit[1] : null;
}

function pickAll(list, match) {
  return list.filter(([k]) => match(k)).map(([, v]) => v);
}

/**
 * Цвет в исходнике записан как угодно: «Серый» и «серый», составные описания
 * «М/К - серый, ЛДСП - Ольха», коды «RAL 7024 (серый графит)» и вовсе не цвет
 * «В ассортименте». Из-за этого в фильтре получалось 113 значений.
 *
 * Исходную строку оставляем в `colors` — она нужна в характеристиках товара,
 * а для фильтра собираем `colorTags`: базовые цвета и декоры.
 */
const NOT_A_COLOR = /^(в ассортименте|разные|любой|по запросу|на выбор)$/i;

/** Слова про фактуру и части изделия — к цвету не относятся. */
const NOISE = /(полуматов|матов|глянцев|структурн|шагрень|эмал)\S*/gi;
const PARTS = /(м\/к|мк|лдсп|каркас|корпус|двери|дверцы|фасад|столешниц|полк)\S*\s*[-—:]?/gi;

/**
 * В данных попадаются латинские буквы вместо кириллических: «Cерый» с латинской C
 * попадал в фильтр отдельным значением. Заменяем только внутри слов,
 * где кириллица уже есть, чтобы не задеть настоящую латиницу.
 */
const HOMOGLYPHS = {
  A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М", O: "О", P: "Р", T: "Т", X: "Х",
  a: "а", c: "с", e: "е", o: "о", p: "р", x: "х", y: "у",
};

function fixHomoglyphs(value) {
  if (!/[а-яё]/i.test(value)) return value;
  return value.replace(/[ABCEHKMOPTXacepoxy]/g, (ch) => HOMOGLYPHS[ch] ?? ch);
}

function colorTags(raw) {
  const tags = [];
  for (const value of raw) {
    if (NOT_A_COLOR.test(value.trim())) continue;
    // Коды RAL убираем до замены омоглифов: иначе «A» в RAL станет кириллической.
    const parts = fixHomoglyphs(value.replace(/RAL\s*\d+/gi, " "))
      .replace(PARTS, " ")
      .split(/[\/,;]| и /);

    for (const part of parts) {
      const clean = part
        .replace(/[()]/g, " ")
        .replace(NOISE, " ")
        .replace(/\s+/g, " ")
        .replace(/^[\s.\-—]+|[\s.\-—]+$/g, "");
      if (!clean || clean.length < 3 || clean.length > 20) continue;
      if (!/[а-яё]/i.test(clean)) continue;
      // «двери синие» и «синий» — один цвет: приводим прилагательное к единственному числу
      const single = clean.includes(" ") ? clean : clean.replace(/ые$/i, "ый").replace(/ие$/i, "ий");
      const tag = single[0].toUpperCase() + single.slice(1).toLowerCase();
      if (!tags.includes(tag)) tags.push(tag);
    }
  }
  return tags;
}

const FIELDS = [
  "colorTags",
  "weight",
  "volume",
  "load",
  "coating",
  "coatingType",
  "warranty",
  "warrantyMonths",
  "country",
  "sleeping",
  "gost",
];

/** В каталоге 14 написаний одного и того же покрытия — сводим к пригодному для фильтра набору. */
function coatingType(raw) {
  const v = raw.toLowerCase();
  if (/порошков/.test(v)) return "Порошковое";
  if (/эмал/.test(v)) return "Эмаль";
  if (/хром/.test(v)) return "Хром";
  if (/оцинков/.test(v)) return "Оцинковка";
  return null;
}

/**
 * Гарантия записана как «1 год», «12 месяцев», «5 лет» и просто «1».
 * Голое число в этом каталоге всегда означает годы — других единиц в нём нет.
 */
function warrantyMonths(raw) {
  const n = num(raw);
  if (n == null) return null;
  if (/месяц/i.test(raw)) return n;
  return n * 12;
}

function warrantyLabel(months) {
  const years = months / 12;
  if (!Number.isInteger(years)) return `${months} мес.`;
  const last = years % 10;
  const tens = years % 100;
  if (tens >= 11 && tens <= 14) return `${years} лет`;
  if (last === 1) return `${years} год`;
  if (last >= 2 && last <= 4) return `${years} года`;
  return `${years} лет`;
}

function enrich(product) {
  const list = pairs(product.desc);
  const next = {};

  // Вес: нетто важнее брутто и веса в упаковке.
  const weight =
    pick(list, (k) => /^вес(\s*\(?нетто\)?)?(,\s*кг)?$/.test(k)) ??
    pick(list, (k) => k.startsWith("вес") && !/брутто|упаковк/.test(k)) ??
    pick(list, (k) => k.startsWith("вес"));
  if (weight) next.weight = num(weight);

  // Объём изделия в м³. «Объём, л» — это вместимость сейфа, другая величина.
  const volume = pick(list, (k) => /^объ[её]м$/.test(k) || /^объ[её]м.*м3/.test(k));
  if (volume && !/\bл\b|литр/i.test(volume)) next.volume = num(volume);

  // Нагрузка: и как «Ключ: значение», и свободным текстом («Максимальная нагрузка 180 кг.»).
  const loads = pickAll(list, (k) => k.includes("нагрузка")).map(num).filter((n) => n != null);
  for (const m of String(product.desc || "").matchAll(/нагрузка[^.\n]{0,40}?(\d+(?:[.,]\d+)?)\s*кг/gi)) {
    const n = num(m[1]);
    if (n != null) loads.push(n);
  }
  if (loads.length) next.load = Math.max(...loads);

  const coating = pick(list, (k) => k === "покрытие" || k === "тип покрытия");
  if (coating) {
    next.coating = coating;
    next.coatingType = coatingType(coating);
  }

  const warranty = pick(list, (k) => k === "гарантия");
  if (warranty) {
    const months = warrantyMonths(warranty);
    if (months) {
      next.warrantyMonths = months;
      next.warranty = warrantyLabel(months);
    }
  }

  const country = pick(list, (k) => k === "страна" || k.startsWith("страна "));
  if (country) next.country = country;

  const sleeping = pick(list, (k) => k === "спальное место");
  if (sleeping) next.sleeping = sleeping;

  const tags = colorTags(product.colors ?? []);
  if (tags.length) next.colorTags = tags;

  const gost = `${product.name} ${product.desc || ""}`.match(/ГОСТ\s*[\dR\s.-]*\d/i);
  if (gost) next.gost = gost[0].replace(/\s+/g, " ").trim();

  for (const f of FIELDS) delete product[f];
  for (const [k, v] of Object.entries(next)) if (v != null && v !== "") product[k] = v;
  return next;
}

const data = JSON.parse(readFileSync(FILE, "utf8"));
const stats = Object.fromEntries(FIELDS.map((f) => [f, 0]));

for (const product of data.products) {
  const got = enrich(product);
  for (const f of FIELDS) if (got[f] != null && got[f] !== "") stats[f]++;
}

console.log(`Товаров: ${data.products.length}`);
for (const [field, count] of Object.entries(stats)) {
  console.log(`  ${field.padEnd(9)} ${String(count).padStart(4)}`);
}

if (dry) {
  console.log("\n--dry: файл не изменён. Примеры:");
  for (const p of data.products.filter((x) => x.load || x.warranty).slice(0, 4)) {
    console.log(" ", JSON.stringify({ sku: p.sku, ...Object.fromEntries(FIELDS.map((f) => [f, p[f]]).filter(([, v]) => v != null)) }));
  }
} else {
  writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log("\nЗаписано в src/data/catalog.json");
}
