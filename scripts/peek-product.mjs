import https from "node:https";
function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  });
}
const h = await get(
  "https://www.metmebel.ru/catalog/armeyskaya-mebel/krovat-armeyskaya-razbornaya-odnoyarusnaya-tip-a-gost-2056-77-km6a/"
);
import fs from "node:fs";
fs.writeFileSync("C:/Users/ACER/mebel/scripts/product-sample.html", h);
const i = h.indexOf("Характер") >= 0 ? h.indexOf("Характер") : h.indexOf("Габарит");
const j = h.indexOf("properties") >= 0 ? h.indexOf("properties") : i;
console.log("idx char", h.indexOf("Характер"), "gab", h.indexOf("Габарит"), "shir", h.indexOf("Ширина"), "vys", h.indexOf("Высота"));
console.log(h.slice(Math.max(0, (h.indexOf("Ширина") || 0) - 200), (h.indexOf("Ширина") || 0) + 800));
console.log("---titles---", (h.match(/prod-img|preview|gallery/g) || []).slice(0, 8));
