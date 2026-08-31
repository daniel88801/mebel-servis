import fs from "node:fs";
const h = fs.readFileSync("C:/Users/ACER/mebel/scripts/product-sample.html", "utf8");
const imgs = [...h.matchAll(/src="(\/upload\/iblock\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi)].map((x) => x[1]);
console.log("unique upload imgs", [...new Set(imgs)].length);
[...new Set(imgs)].slice(0, 20).forEach((u) => console.log(u));
const big = h.match(/id="product-images"[\s\S]{0,4000}/);
console.log("\nGALLERY BLOCK\n", (big && big[0].slice(0, 1500)) || "no block");
const fancy = h.match(/class="[^"]*gallery[^"]*"[\s\S]{0,2000}/i);
console.log("\nCLASS GALLERY\n", fancy && fancy[0].slice(0, 1200));
