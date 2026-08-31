import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const data = ctx.window.MS;
for (const p of data.products) {
  if (p.price === 0) p.price = null;
}

const used = new Set(data.categories.map((c) => c.image.replace(/^images\/catalog\//, "")));
for (const p of data.products) {
  const f = String(p.image || "").replace(/^images\/catalog\//, "");
  if (f) used.add(f);
}
const dir = path.join(ROOT, "images/catalog");
let removed = 0;
for (const f of fs.readdirSync(dir)) {
  if (!used.has(f)) {
    fs.unlinkSync(path.join(dir, f));
    removed++;
  }
}
console.log("removed unused", removed, "kept", used.size);

const out = `window.MS = window.MS || {};

MS.company = ${JSON.stringify(data.company, null, 2)};

MS.categories = ${JSON.stringify(data.categories, null, 2)};

MS.products = ${JSON.stringify(data.products, null, 2)};

MS.advantages = ${JSON.stringify(data.advantages, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, "js/data.js"), out);
console.log("products", data.products.length, "priced", data.products.filter((p) => p.price != null).length);
