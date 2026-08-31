import https from "node:https";
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, loc: res.headers.location, html: Buffer.concat(chunks).toString("utf8") }));
      })
      .on("error", reject);
  });
}
const h = (await get("https://www.metmebel.ru/catalog/")).html;
const re = /href="(\/catalog\/[^"]+\/)"[^>]*>([^<]{0,80})/g;
const seen = new Set();
let m;
while ((m = re.exec(h))) {
  const href = m[1];
  const t = m[2].replace(/\s+/g, " ").trim();
  if (seen.has(href)) continue;
  seen.add(href);
  if (/работ|строит|бытов|общежит|арме|крова|каркас|расклад|учащ|аудитор/i.test(href + t)) {
    console.log(href, "|", t);
  }
}
console.log("total links", seen.size);
