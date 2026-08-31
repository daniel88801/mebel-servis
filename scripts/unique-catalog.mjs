import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = "C:/Users/ACER/mebel";
const IMG_DIR = path.join(ROOT, "images", "catalog");
fs.mkdirSync(IMG_DIR, { recursive: true });

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
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,image/avif,image/webp,image/png,image/jpeg,*/*",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          get(next).then(resolve, reject);
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

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function loadData() {
  const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
  return ctx.window.MS;
}

function decode(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parsePriceText(text) {
  const m = String(text)
    .replace(/\s/g, " ")
    .match(/(\d[\d\s]{2,})\s*руб/i);
  if (!m) return null;
  const n = Number(m[1].replace(/\s/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
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
      price: parsePriceText(block),
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
  return [...new Set(urls)];
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

function fileHash(file) {
  return crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 800) return true;
  const { status, body } = await get(url);
  if (status !== 200 || body.length < 400) return false;
  fs.writeFileSync(dest, body);
  return true;
}

function parseSectionIcons(html) {
  const map = {};
  const re = /background:\s*url\((\/upload\/iblock\/[^)]+)\)[\s\S]{0,180}?href="(\/catalog\/[^"]+\/)"/gi;
  for (const m of html.matchAll(re)) {
    const slug = m[2].replace(/^\/catalog\//, "").replace(/\/$/, "");
    map[slug] = "https://www.metmebel.ru" + m[1];
  }
  return map;
}

function writeData(data, products) {
  const out = `window.MS = window.MS || {};

MS.company = ${JSON.stringify(data.company, null, 2)};

MS.categories = ${JSON.stringify(data.categories, null, 2)};

MS.products = ${JSON.stringify(
    products.map((p) => {
      const o = { ...p };
      delete o.gallery;
      delete o.href;
      delete o.sourceImage;
      return o;
    }),
    null,
    2
  )};

MS.advantages = ${JSON.stringify(data.advantages, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, "js/data.js"), out);
}

async function main() {
  const data = loadData();
  const products = data.products;
  console.log("products in data", products.length);

  const { body: catalogHtmlBuf } = await get("https://www.metmebel.ru/catalog/");
  const catalogHtml = catalogHtmlBuf.toString("utf8");
  const icons = parseSectionIcons(catalogHtml);
  console.log("section icons", Object.keys(icons).length, Object.keys(icons).join(", "));

  const listed = [];
  for (const cat of data.categories) {
    const slug = CATEGORY_SLUG[cat.id];
    if (!slug) continue;
    const { status, body } = await get(`https://www.metmebel.ru/catalog/${slug}/?SHOWALL_1=1`);
    const items = parseListing(body.toString("utf8"), cat.id);
    console.log("list", cat.id, status, items.length);
    listed.push(...items);

    const iconUrl = icons[slug];
    if (iconUrl) {
      const ext = path.extname(iconUrl.split("?")[0]).toLowerCase() || ".png";
      const fname = "cover-" + cat.id + ext;
      const dest = path.join(IMG_DIR, fname);
      const ok = await download(iconUrl, dest);
      if (ok && fs.statSync(dest).size > 400) {
        cat.icon = "images/catalog/" + fname;
        cat.iconBytes = fs.statSync(dest).size;
      }
    }
  }

  const byKey = new Map();
  for (const p of products) byKey.set(`${p.category}|${p.sku}|${p.name}`, p);
  for (const row of listed) {
    const key = `${row.category}|${row.sku}|${row.name}`;
    let p = byKey.get(key);
    if (!p) {
      p = {
        id: `${row.category}-${row.sku || row.name}-${products.length + 1}`,
        sku: row.sku,
        name: row.name,
        category: row.category,
        price: row.price,
        image: "",
        colors: [],
      };
      products.push(p);
      byKey.set(key, p);
    }
    p.href = row.href;
    p.sourceImage = row.sourceImage;
    if (row.price != null) p.price = row.price;
    if (row.price == null && p.price === 0) p.price = null;
  }
  console.log("products after merge", products.length);

  await mapLimit(products, 8, async (p, idx) => {
    if (!p.href) return;
    try {
      const { status, body } = await get(p.href);
      if (status !== 200) return;
      const html = body.toString("utf8");
      const listingKeep = p.price;
      const itemprop = html.match(/itemprop="price"\s+content="([0-9.]+)"/i);
      const visible = parsePriceText(html);
      let parsed = null;
      if (itemprop) {
        const n = Math.round(Number(itemprop[1]));
        if (Number.isFinite(n) && n > 0) parsed = n;
      }
      if (parsed == null && visible != null) parsed = visible;
      if (parsed != null) p.price = parsed;
      else if (listingKeep != null && listingKeep > 0) p.price = listingKeep;
      else p.price = null;
      p.gallery = galleryUrls(html).map((u) => "https://www.metmebel.ru" + u);
      if ((idx + 1) % 80 === 0) console.log("details", idx + 1);
    } catch {
      p.gallery = p.gallery || [];
    }
  });

  const hashOf = new Map();
  async function ensureFile(url) {
    const fname = fileFromUrl(url);
    const dest = path.join(IMG_DIR, fname);
    const ok = await download(url, dest);
    if (!ok) return null;
    let h = hashOf.get(dest);
    if (!h) {
      h = fileHash(dest);
      hashOf.set(dest, h);
    }
    return { dest, fname, hash: h, rel: "images/catalog/" + fname };
  }

  const usedHash = new Set();
  let uniqueAssigned = 0;
  let fallback = 0;

  // Prefer uniqueness inside each category, then globally.
  for (const cat of data.categories) {
    const items = products.filter((p) => p.category === cat.id);
    for (const p of items) {
      const candidates = [...new Set([...(p.gallery || []), p.sourceImage].filter(Boolean))];
      let assigned = null;
      for (const url of candidates) {
        const file = await ensureFile(url);
        if (!file) continue;
        if (usedHash.has(file.hash)) continue;
        usedHash.add(file.hash);
        p.image = file.rel;
        assigned = file.hash;
        uniqueAssigned++;
        break;
      }
      if (!assigned) {
        if (candidates[0]) {
          const file = await ensureFile(candidates[0]);
          if (file) p.image = file.rel;
        }
        fallback++;
      }
    }
  }

  // Second pass: unused gallery photos for remaining collisions
  const hashCount = {};
  for (const p of products) {
    const abs = path.join(ROOT, p.image);
    if (!fs.existsSync(abs)) continue;
    const h = hashOf.get(abs) || fileHash(abs);
    hashOf.set(abs, h);
    hashCount[h] = (hashCount[h] || 0) + 1;
  }
  for (const p of products) {
    const abs = path.join(ROOT, p.image || "");
    const h = fs.existsSync(abs) ? hashOf.get(abs) || fileHash(abs) : null;
    if (!h || hashCount[h] < 2) continue;
    const candidates = [...new Set([...(p.gallery || []), p.sourceImage].filter(Boolean))];
    for (const url of candidates) {
      const file = await ensureFile(url);
      if (!file || usedHash.has(file.hash)) continue;
      usedHash.add(file.hash);
      hashCount[h]--;
      hashCount[file.hash] = (hashCount[file.hash] || 0) + 1;
      p.image = file.rel;
      uniqueAssigned++;
      fallback--;
      break;
    }
  }

  // Category covers: unique source product photos, not generated files.
  const usedCovers = new Set();
  for (const cat of data.categories) {
    const pick = products.find((p) => {
      if (p.category !== cat.id || !p.image) return false;
      const abs = path.join(ROOT, p.image);
      if (!fs.existsSync(abs)) return false;
      const h = hashOf.get(abs) || fileHash(abs);
      return !usedCovers.has(h);
    });
    if (pick) {
      const abs = path.join(ROOT, pick.image);
      const h = hashOf.get(abs) || fileHash(abs);
      cat.image = pick.image;
      usedCovers.add(h);
    }
    delete cat.iconBytes;
  }

  const hashes = {};
  for (const p of products) {
    const abs = path.join(ROOT, p.image);
    if (!fs.existsSync(abs)) continue;
    const h = hashOf.get(abs) || fileHash(abs);
    hashes[h] = (hashes[h] || 0) + 1;
  }
  const dupHash = Object.values(hashes).filter((n) => n > 1).length;
  const catHashes = data.categories.map((c) => {
    const abs = path.join(ROOT, c.image);
    return fs.existsSync(abs) ? fileHash(abs) : "MISS";
  });
  console.log("uniqueAssigned", uniqueAssigned, "fellBackSameSource", fallback);
  console.log("unique product image hashes", Object.keys(hashes).length, "hash groups with repeats", dupHash);
  console.log("unique category cover hashes", new Set(catHashes).size, "of", data.categories.length);
  console.log(
    "priced",
    products.filter((p) => p.price != null && p.price > 0).length,
    "null",
    products.filter((p) => p.price == null || p.price === 0).length
  );

  writeData(data, products);
  console.log("wrote data.js");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
