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
const cats = [
  "rasprodazha",
  "armeyskaya-mebel",
  "metallicheskie-krovati",
  "korpusnaya-mebel",
  "mebel-na-metallokarkase",
  "raskladnaya-mebel-ldsp",
  "raskladnaya-mebel",
  "chekhly",
  "ofisnaya-mebel",
  "auditornaya-mebel",
  "shkafy-metallicheskie",
  "postelnye-prinadlezhnosti",
  "mebel-dlya-gostinits-i-khostelov",
  "mebel-dlya-rabochikh-i-stroiteley",
  "mebel-dlya-obshchezhitiy",
  "proizvodstvennaya-mebel",
  "mebel-dlya-banketa",
  "medicinskaya-mebel",
  "seyfy",
];
let total = 0;
for (const u of cats) {
  const h = await get("https://www.metmebel.ru/catalog/" + u + "/?SHOWALL_1=1");
  const n = (h.match(/class="title-products"/g) || []).length;
  total += n;
  console.log(u, n, h.length);
}
console.log("TOTAL", total);
