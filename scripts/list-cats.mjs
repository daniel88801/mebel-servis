import https from "node:https";
import fs from "node:fs";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, loc: res.headers.location, html: Buffer.concat(chunks).toString("utf8") })
        );
      })
      .on("error", reject);
  });
}

const h = (await get("https://www.metmebel.ru/catalog/")).html;
fs.writeFileSync("C:/Users/ACER/mebel/scripts/catalog-index.html", h);
const re = /href="(\/catalog\/[a-z0-9\-]+\/)"[^>]*>([\s\S]{0,120}?)<\/a>/gi;
const seen = new Map();
let m;
while ((m = re.exec(h))) {
  const href = m[1];
  const t = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!t || t.length > 80) continue;
  if (!seen.has(href)) seen.set(href, t);
}
console.log("count", seen.size);
for (const [href, t] of seen) console.log(href, "|", t);

const army = (await get("https://www.metmebel.ru/catalog/armeyskaya-mebel/")).html;
const filterNames = [...army.matchAll(/<label[^>]*>([\s\S]{0,80}?)<\/label>/gi)].map((x) =>
  x[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
);
console.log("\nLABELS", [...new Set(filterNames)].slice(0, 40));
const props = [...army.matchAll(/NAME\] => ([^\n]+)/g)].map((x) => x[1].trim());
console.log("PROPS", [...new Set(props)]);
