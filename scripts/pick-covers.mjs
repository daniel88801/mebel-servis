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

function h(rel) {
  return crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex");
}

for (const cat of ["plastic", "corpus", "sale", "students", "workers", "dorms", "industrial", "hotels", "medical", "safes", "bedding"]) {
  console.log("\n==", cat);
  MS.products
    .filter((p) => p.category === cat)
    .slice(0, 8)
    .forEach((p) => console.log(p.sku, p.name, p.image.split("/").pop(), fs.statSync(path.join(ROOT, p.image)).size));
}
