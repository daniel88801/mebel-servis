import fs from "node:fs";
const h = fs.readFileSync("C:/Users/ACER/mebel/scripts/product-sample.html", "utf8");
const start = Math.max(0, h.indexOf("Габарит") - 100);
console.log(h.slice(start, start + 2500));
console.log("\n==== PRICE ====");
const p = h.indexOf("7 640");
console.log(h.slice(p - 150, p + 200));
