import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const MS = ctx.window.MS;

function fileHash(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return crypto.createHash("md5").update(fs.readFileSync(abs)).digest("hex");
}

console.log("products", MS.products.length);
console.log("priced", MS.products.filter((p) => p.price != null).length);
console.log("request", MS.products.filter((p) => p.price == null).length);
const missing = MS.products.filter((p) => !p.image || !fs.existsSync(path.join(ROOT, p.image)));
console.log("missing images", missing.length);

const pathCounts = {};
const hashCounts = {};
for (const p of MS.products) {
  pathCounts[p.image] = (pathCounts[p.image] || 0) + 1;
  const h = fileHash(p.image);
  if (h) hashCounts[h] = (hashCounts[h] || 0) + 1;
}
console.log("unique paths", Object.keys(pathCounts).length);
console.log("unique hashes", Object.keys(hashCounts).length);
console.log("path dup groups", Object.values(pathCounts).filter((n) => n > 1).length);
console.log("hash dup groups", Object.values(hashCounts).filter((n) => n > 1).length);

console.log("\nper category uniqueness");
for (const cat of MS.categories) {
  const items = MS.products.filter((p) => p.category === cat.id);
  const hashes = new Set(items.map((p) => fileHash(p.image)));
  const dups = items.length - hashes.size;
  console.log(cat.id.padEnd(12), items.length, "items", hashes.size, "hashes", dups ? "DUPS " + dups : "OK");
}

const covers = MS.categories.map((c) => fileHash(c.image));
console.log("\nunique covers", new Set(covers).size, "of", covers.length);

console.log("\nspot prices");
for (const sku of ["КМ6А", "КМ6Ф", "СТД120", "СТД150", "СТД180", "СтЛ35Р", "ТЛ23Р", "Пл1", "СТЛ143"]) {
  const items = MS.products.filter((p) => p.sku === sku);
  items.forEach((p) => console.log(sku, p.category, p.price));
}
