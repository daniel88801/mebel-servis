import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const products = ctx.window.MS.products;
const cats = ctx.window.MS.categories;

const byImage = {};
let missing = 0;
let generatedFallback = 0;
for (const p of products) {
  const img = p.image;
  if (!img) missing++;
  if (img && !img.startsWith("images/catalog/")) generatedFallback++;
  byImage[img] = byImage[img] || [];
  byImage[img].push(p.id);
}
const dups = Object.entries(byImage).filter(([, ids]) => ids.length > 1);
console.log("products", products.length);
console.log("unique image paths", Object.keys(byImage).length);
console.log("duplicate paths", dups.length);
console.log("not in catalog folder", generatedFallback);
console.log("missing path", missing);
console.log("top dups:");
dups
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 15)
  .forEach(([img, ids]) => console.log(ids.length, img, ids.slice(0, 4).join(",")));

const hashes = {};
const files = fs.readdirSync(path.join(ROOT, "images/catalog"));
for (const f of files) {
  const buf = fs.readFileSync(path.join(ROOT, "images/catalog", f));
  const h = crypto.createHash("md5").update(buf).digest("hex");
  hashes[h] = hashes[h] || [];
  hashes[h].push(f);
}
const hashDups = Object.entries(hashes).filter(([, fsx]) => fsx.length > 1);
console.log("files", files.length, "unique hashes", Object.keys(hashes).length, "hash-collisions", hashDups.length);
hashDups
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([h, fsx]) => console.log(fsx.length, h.slice(0, 8), fsx.slice(0, 5).join(", ")));

console.log("cat covers", cats.map((c) => c.id + "=" + c.image).join(" | "));
