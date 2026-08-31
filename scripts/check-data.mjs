import fs from "node:fs";
const s = fs.readFileSync("C:/Users/ACER/mebel/js/data.js", "utf8");
console.log(s.slice(0, 450));
const names = [...s.matchAll(/name: "([^"]+)"/g)].slice(0, 10).map((x) => x[1]);
console.log("names", names);
const prices = (s.match(/price: /g) || []).length;
const nulls = (s.match(/price: null/g) || []).length;
console.log("price fields", prices, "null", nulls);
console.log("products", (s.match(/category: "/g) || []).length);
