import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const MS = ctx.window.MS;

const suspects = ["СтЛ35Р", "ТЛ23Р", "ШЛ45Р", "СТЛ143", "СтД81", "ПД-01", "КМ6А", "СТД120", "СТД150", "СТД180"];
for (const sku of suspects) {
  const items = MS.products.filter((p) => p.sku === sku);
  for (const p of items) console.log(p.sku, p.category, p.price, p.name, p.image);
}

console.log("\nprice stats");
const prices = MS.products.map((p) => p.price).filter((n) => n != null);
console.log("min", Math.min(...prices), "max", Math.max(...prices), "median", prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]);
const weird = MS.products.filter((p) => p.price < 100 || p.price > 500000);
console.log("weird count", weird.length);
weird.slice(0, 20).forEach((p) => console.log(p.sku, p.price, p.name));

console.log("\ncategory covers");
const seen = new Set();
for (const c of MS.categories) {
  const abs = path.join(ROOT, c.image);
  const exists = fs.existsSync(abs);
  const size = exists ? fs.statSync(abs).size : 0;
  const h = exists ? crypto.createHash("md5").update(fs.readFileSync(abs)).digest("hex") : "MISS";
  console.log(c.id, exists, size, h.slice(0, 8), c.image, c.icon || "");
  if (seen.has(h)) console.log("  DUP COVER", c.id);
  seen.add(h);
}

console.log("\ncover icons");
for (const f of fs.readdirSync(path.join(ROOT, "images/catalog")).filter((x) => x.startsWith("cover-"))) {
  const st = fs.statSync(path.join(ROOT, "images/catalog", f));
  console.log(f, st.size);
}
