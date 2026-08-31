import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const data = ctx.window.MS;

function h(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return crypto.createHash("md5").update(fs.readFileSync(abs)).digest("hex");
}

function pick(catId, test) {
  return data.products.find((p) => p.category === catId && test(p) && p.image);
}

const picks = {
  sale: pick("sale", (p) => p.sku === "СтЛ35Р"),
  army: pick("army", (p) => /двух.?ярус|КМ7|двухъярус/i.test(p.name) || p.sku === "КМ6А"),
  beds: pick("beds", (p) => /одноярус/i.test(p.name)),
  corpus: pick("corpus", (p) => p.sku === "СтЛ1" || /стол из лдсп/i.test(p.name)),
  frame: pick("frame", (p) => /стол/i.test(p.name)),
  folding: pick("folding", (p) => p.sku === "СТД120"),
  plastic: pick("plastic", (p) => p.sku === "СтР180" && /белый/i.test(p.name)),
  covers: pick("covers", (p) => /чехол/i.test(p.name) && /син/i.test(p.name)) || pick("covers", (p) => /сумк|чехол/i.test(p.name)),
  office: pick("office", (p) => /эргоном|угл/i.test(p.name)),
  students: pick("students", (p) => p.sku === "СтУ1"),
  lockers: pick("lockers", (p) => /шкаф/i.test(p.name)),
  bedding: pick("bedding", (p) => /матра/i.test(p.name)),
  hotels: pick("hotels", (p) => /комплект/i.test(p.name)),
  workers: pick("workers", (p) => /шкаф/i.test(p.name)) || pick("workers", (p) => /стол/i.test(p.name)),
  dorms: pick("dorms", (p) => /шкаф/i.test(p.name)) || pick("dorms", (p) => /тумб/i.test(p.name)),
  industrial: pick("industrial", (p) => /стеллаж/i.test(p.name)),
  banquet: pick("banquet", (p) => /стул/i.test(p.name)) || pick("banquet", (p) => /скамь/i.test(p.name)),
  medical: pick("medical", (p) => /стол/i.test(p.name)),
  safes: pick("safes", (p) => /сейф/i.test(p.name)),
};

console.log("initial picks");
for (const [id, p] of Object.entries(picks)) {
  console.log(id, p ? p.sku + " " + p.name : "NONE");
}

const used = new Set();
for (const cat of data.categories) {
  let p = picks[cat.id];
  if (p && p.image && !used.has(h(p.image))) {
    cat.image = p.image;
    used.add(h(p.image));
    continue;
  }
  const fallback = data.products.find((x) => x.category === cat.id && x.image && !used.has(h(x.image)));
  if (fallback) {
    cat.image = fallback.image;
    used.add(h(fallback.image));
    console.log("fallback", cat.id, fallback.sku, fallback.name);
  }
}

const hashes = data.categories.map((c) => h(c.image));
console.log("unique covers", new Set(hashes).size, "of", hashes.length);
data.categories.forEach((c) => console.log(c.id, c.image.split("/").pop()));

const out = `window.MS = window.MS || {};

MS.company = ${JSON.stringify(data.company, null, 2)};

MS.categories = ${JSON.stringify(data.categories, null, 2)};

MS.products = ${JSON.stringify(data.products, null, 2)};

MS.advantages = ${JSON.stringify(data.advantages, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, "js/data.js"), out);
console.log("wrote data.js");
