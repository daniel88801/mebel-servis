import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = "C:/Users/ACER/mebel";
const IMG_DIR = path.join(ROOT, "images", "catalog");

const CATEGORY_SLUG = {
  sale: "rasprodazha",
  army: "armeyskaya-mebel",
  beds: "metallicheskie-krovati",
  corpus: "korpusnaya-mebel",
  frame: "mebel-na-metallokarkase",
  folding: "raskladnaya-mebel-ldsp",
  plastic: "raskladnaya-mebel",
  covers: "chekhly",
  office: "ofisnaya-mebel",
  students: "auditornaya-mebel",
  lockers: "shkafy-metallicheskie",
  bedding: "postelnye-prinadlezhnosti",
  hotels: "mebel-dlya-gostinits-i-khostelov",
  workers: "mebel-dlya-rabochikh-i-stroiteley",
  dorms: "mebel-dlya-obshchezhitiy",
  industrial: "proizvodstvennaya-mebel",
  banquet: "mebel-dlya-banketa",
  medical: "medicinskaya-mebel",
  safes: "seyfy",
};

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
    req.setTimeout(40000, () => req.destroy(new Error("timeout")));
  });
}

function decode(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function fileFromUrl(url) {
  const u = decodeURIComponent(url.split("?")[0].replace(/\\/g, "/"));
  const parts = u.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2] || "img";
  const ext = (path.extname(last) || ".jpg").toLowerCase();
  const safeLast = last.replace(/[^\w.\-]+/g, "") || "img" + ext;
  return `src-${prev.slice(0, 3)}-${safeLast}`;
}

function fileHash(abs) {
  return crypto.createHash("md5").update(fs.readFileSync(abs)).digest("hex");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 800) return true;
  const { status, body } = await get(url);
  if (status !== 200 || body.length < 400) return false;
  fs.writeFileSync(dest, body);
  return true;
}

function parseListing(html, category) {
  const items = [];
  const blocks = html.split(/<li class="wrap[^"]*">/);
  for (const block of blocks.slice(1)) {
    const imgM = block.match(/<(?:img|IMG)[^>]+src="(\/upload\/iblock\/[^"]+)"/i);
    const titleM = block.match(/class="title-products"\s+href="(\/catalog\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleM) continue;
    const skuM = titleM[2].match(/\[([^\]]+)\]/);
    const name = decode(titleM[2].replace(/<[^>]+>/g, " "))
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    items.push({
      sku: skuM ? decode(skuM[1]).trim() : "",
      name,
      category,
      href: "https://www.metmebel.ru" + titleM[1],
      sourceImage: imgM ? "https://www.metmebel.ru" + imgM[1].replace(/ /g, "%20") : "",
    });
  }
  return items;
}

function galleryUrls(html) {
  const urls = [];
  const box = html.match(/class="span4 product-photo-box"([\s\S]*?)<div class="span5 product-desc">/);
  const chunk = box ? box[1] : html;
  for (const re of [
    /(?:src|href|data-src)="(\/upload\/iblock\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi,
    /url\((?:'|")?(\/upload\/iblock\/[^)'"]+\.(?:jpg|jpeg|png|webp))/gi,
  ]) {
    for (const m of chunk.matchAll(re)) urls.push(m[1]);
  }
  return [...new Set(urls)].map((u) => "https://www.metmebel.ru" + u);
}

const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const data = ctx.window.MS;

const hashCache = new Map();
function hRel(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  if (!hashCache.has(abs)) hashCache.set(abs, fileHash(abs));
  return hashCache.get(abs);
}

async function ensure(url) {
  const fname = fileFromUrl(url);
  const dest = path.join(IMG_DIR, fname);
  const ok = await download(url, dest);
  if (!ok) return null;
  if (!hashCache.has(dest)) hashCache.set(dest, fileHash(dest));
  return { rel: "images/catalog/" + fname, hash: hashCache.get(dest) };
}

const listedByCat = {};
for (const cat of data.categories) {
  const slug = CATEGORY_SLUG[cat.id];
  const { body } = await get(`https://www.metmebel.ru/catalog/${slug}/?SHOWALL_1=1`);
  listedByCat[cat.id] = parseListing(body.toString("utf8"), cat.id);
  console.log("listed", cat.id, listedByCat[cat.id].length);
}

function usedInCategory(catId) {
  const set = new Set();
  for (const p of data.products.filter((x) => x.category === catId)) {
    const h = hRel(p.image);
    if (h) set.add(h);
  }
  return set;
}

function dupsIn(catId) {
  const counts = {};
  const items = data.products.filter((p) => p.category === catId);
  for (const p of items) {
    const h = hRel(p.image);
    if (!h) continue;
    counts[h] = (counts[h] || 0) + 1;
  }
  return items.filter((p) => counts[hRel(p.image)] > 1);
}

let fixed = 0;
const problemCats = data.categories
  .map((c) => c.id)
  .filter((id) => dupsIn(id).length);

console.log("cats with dups", problemCats.join(", "));

for (const catId of problemCats) {
  const dups = dupsIn(catId);
  const listed = listedByCat[catId] || [];
  console.log("fix", catId, dups.length);
  for (const p of dups) {
    const row = listed.find((r) => r.sku === p.sku && r.name === p.name);
    const candidates = [];
    if (row?.sourceImage) candidates.push(row.sourceImage);
    if (row?.href) {
      try {
        const { status, body } = await get(row.href);
        if (status === 200) candidates.push(...galleryUrls(body.toString("utf8")));
      } catch {
        /* skip */
      }
    }
    const used = usedInCategory(catId);
    used.delete(hRel(p.image));
    let assigned = false;
    for (const url of [...new Set(candidates)]) {
      const file = await ensure(url);
      if (!file) continue;
      if (used.has(file.hash)) continue;
      p.image = file.rel;
      assigned = true;
      fixed++;
      break;
    }
    if (!assigned) console.log("  still same", p.sku, p.name);
  }
}

const usedCovers = new Set();
for (const cat of data.categories) {
  const pick = data.products.find((p) => {
    if (p.category !== cat.id || !p.image) return false;
    const h = hRel(p.image);
    return h && !usedCovers.has(h);
  });
  if (pick) {
    cat.image = pick.image;
    usedCovers.add(hRel(pick.image));
  }
}

const out = `window.MS = window.MS || {};

MS.company = ${JSON.stringify(data.company, null, 2)};

MS.categories = ${JSON.stringify(data.categories, null, 2)};

MS.products = ${JSON.stringify(data.products, null, 2)};

MS.advantages = ${JSON.stringify(data.advantages, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, "js/data.js"), out);
console.log("fixed", fixed);
console.log("wrote data.js");
