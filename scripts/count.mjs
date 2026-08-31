import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

const urls = [
  "armeyskaya-mebel",
  "metallicheskie-krovati",
  "mebel-dlya-obshchezhitiy",
  "auditornaya-mebel",
  "mebel-na-metallokarkase",
  "raskladnaya-mebel-ldsp",
];

for (const u of urls) {
  const h = await get("https://www.metmebel.ru/catalog/" + u + "/?SHOWALL_1=1");
  const n = (h.match(/class="title-products"/g) || []).length;
  console.log(u, "titles", n, "len", h.length);
}
