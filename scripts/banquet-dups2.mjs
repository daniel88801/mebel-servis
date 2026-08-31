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
  return crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex");
}

for (const catId of ["banquet", "corpus", "folding"]) {
  const items = MS.products.filter((p) => p.category === catId);
  const groups = {};
  for (const p of items) {
    const h = fileHash(p.image);
    (groups[h] = groups[h] || []).push(p);
  }
  console.log("\n==", catId);
  for (const a of Object.values(groups).filter((x) => x.length > 1)) {
    console.log(a.length, a.map((p) => p.sku + " / " + p.image.split("/").pop()).join(" | "));
  }
}
