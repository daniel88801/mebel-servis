import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 Chrome/124", Accept: "text/html" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          get(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
  });
}

const urls = [
  "https://www.metmebel.ru/catalog/rasprodazha/?SHOWALL_1=1",
  "https://www.metmebel.ru/catalog/armeyskaya-mebel/?SHOWALL_1=1",
];

for (const url of urls) {
  const { status, body } = await get(url);
  console.log("\n==", url, status);
  const blocks = body.split(/<li class="wrap[^"]*">/).slice(1);
  const skus = ["СтЛ35Р", "ТЛ23Р", "ШЛ45Р", "СТЛ143", "СтД81", "ПД-01", "КМ6А", "ТС"];
  for (const sku of skus) {
    const block = blocks.find((b) => b.includes("[" + sku + "]") || b.includes("[" + sku));
    if (!block) continue;
    const title = (block.match(/class="title-products"[^>]*>([\s\S]*?)<\/a>/) || [])[1];
    const priceBit = block.match(/([\d\s]{3,})\s*руб|по запросу|под заказ/i);
    const itemprop = block.match(/itemprop="price"[^>]*content="([^"]+)"/);
    console.log(sku, "title", (title || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80));
    console.log("  match", priceBit && priceBit[0], "itemprop", itemprop && itemprop[1]);
  }
}
