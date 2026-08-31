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
const h = await get("https://www.metmebel.ru/catalog/mebel-dlya-rabochikh-i-stroiteley/?SHOWALL_1=1");
console.log("titles", (h.match(/class="title-products"/g) || []).length, "len", h.length);
const i = h.indexOf("title-products");
console.log(h.slice(Math.max(0, i - 200), i + 400));
