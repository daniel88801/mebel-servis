import https from "node:https";
import fs from "node:fs";
import path from "node:path";

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 Chrome/124", Accept: "text/html,image/*" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          get(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
  });
}

const { status, body } = await get("https://www.metmebel.ru/catalog/");
const html = body.toString("utf8");
console.log("catalog status", status, "len", html.length);
fs.writeFileSync("C:/Users/ACER/mebel/scripts/catalog-index.html", html);

const imgs = [...html.matchAll(/src="(\/upload\/[^" ]+\.(?:jpg|jpeg|png|webp))"/gi)].map((m) => m[1]);
console.log("upload imgs", [...new Set(imgs)].length);
[...new Set(imgs)].slice(0, 50).forEach((u) => console.log(u));

const cards = [...html.matchAll(/<a[^>]+href="(\/catalog\/[^"?#]+\/)"[\s\S]{0,800}/gi)];
console.log("card-like", cards.length);
for (const m of cards.slice(0, 30)) {
  const chunk = m[0].replace(/\s+/g, " ").slice(0, 280);
  console.log("---", m[1]);
  console.log(chunk);
}
