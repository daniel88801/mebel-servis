import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import https from "node:https";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const MS = ctx.window.MS;

function fileHash(rel) {
  return crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex");
}

const items = MS.products.filter((p) => p.category === "banquet");
const groups = {};
for (const p of items) {
  const h = fileHash(p.image);
  (groups[h] = groups[h] || []).push(p);
}
const dups = Object.values(groups).filter((a) => a.length > 1);
console.log("banquet dup groups", dups.length);
for (const a of dups) {
  console.log(
    a.length,
    a.map((p) => p.sku + " " + p.name).join(" | "),
    a[0].image
  );
}

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
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
  });
}

const sample = dups[0] && dups[0][0];
if (sample) {
  const html = await get("https://www.metmebel.ru/catalog/mebel-dlya-banketa/?SHOWALL_1=1");
  const blocks = html.split(/<li class="wrap[^"]*">/).slice(1);
  for (const p of dups.flat()) {
    const block = blocks.find((b) => b.includes("[" + p.sku + "]"));
    if (!block) continue;
    const img = block.match(/src="(\/upload\/iblock\/[^"]+)"/i);
    console.log("listing", p.sku, img && img[1]);
  }
}
