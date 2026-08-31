import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";

const CATEGORY_SLUG = {
  sale: "rasprodazha",
  army: "armeyskaya-mebel",
  beds: "metallicheskie-krovati",
  corpus: "korpusnaya-mebel",
  frame: "mebel-na-metallokarkase",
  folding: "raskladnaya-mebel-ldsp",
  plastic: "raskladnaya-mebel",
  covers: "chekhly",
  office: "ofisnaya-mebel",
  students: "auditornaya-mebel",
  lockers: "shkafy-metallicheskie",
  bedding: "postelnye-prinadlezhnosti",
  hotels: "mebel-dlya-gostinits-i-khostelov",
  workers: "mebel-dlya-rabochikh-i-stroiteley",
  dorms: "mebel-dlya-obshchezhitiy",
  industrial: "proizvodstvennaya-mebel",
  banquet: "mebel-dlya-banketa",
  medical: "medicinskaya-mebel",
  safes: "seyfy",
};

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 Chrome/124", Accept: "text/html" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          get(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("error", reject);
    req.setTimeout(40000, () => req.destroy(new Error("timeout")));
  });
}

function decode(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parsePriceText(text) {
  if (/по запросу/i.test(text) && !/(\d[\d\s]{2,})\s*руб/i.test(text)) return null;
  const m = String(text)
    .replace(/\s/g, " ")
    .match(/(\d[\d\s]{2,})\s*руб/i);
  if (!m) return null;
  const n = Number(m[1].replace(/\s/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseListing(html, category) {
  const items = [];
  const blocks = html.split(/<li class="wrap[^"]*">/);
  for (const block of blocks.slice(1)) {
    const titleM = block.match(/class="title-products"\s+href="(\/catalog\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleM) continue;
    const skuM = titleM[2].match(/\[([^\]]+)\]/);
    const name = decode(titleM[2].replace(/<[^>]+>/g, " "))
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const priceBlock = block.match(/class="[^"]*price[^"]*"[\s\S]{0,200}/i);
    const priceSrc = priceBlock ? priceBlock[0] : block;
    items.push({
      sku: skuM ? decode(skuM[1]).trim() : "",
      name,
      category,
      price: parsePriceText(priceSrc),
      asked: /по запросу/i.test(priceSrc),
    });
  }
  return items;
}

const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const data = ctx.window.MS;

let set = 0;
let nulled = 0;
for (const cat of data.categories) {
  delete cat.icon;
  const slug = CATEGORY_SLUG[cat.id];
  const { body } = await get(`https://www.metmebel.ru/catalog/${slug}/?SHOWALL_1=1`);
  const items = parseListing(body, cat.id);
  console.log(cat.id, items.length, "priced", items.filter((x) => x.price != null).length, "ask", items.filter((x) => x.asked).length);
  for (const row of items) {
    const p = data.products.find((x) => x.category === row.category && x.sku === row.sku && x.name === row.name);
    if (!p) continue;
    if (row.asked || row.price == null) {
      if (p.price != null) nulled++;
      p.price = null;
    } else if (p.price !== row.price) {
      p.price = row.price;
      set++;
    }
  }
}

const out = `window.MS = window.MS || {};

MS.company = ${JSON.stringify(data.company, null, 2)};

MS.categories = ${JSON.stringify(data.categories, null, 2)};

MS.products = ${JSON.stringify(data.products, null, 2)};

MS.advantages = ${JSON.stringify(data.advantages, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, "js/data.js"), out);
console.log("updated prices", set, "set to request", nulled);
console.log(
  "priced",
  data.products.filter((p) => p.price != null).length,
  "null",
  data.products.filter((p) => p.price == null).length
);
