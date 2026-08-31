import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = "C:/Users/ACER/mebel";
const DIR = path.join(ROOT, "images", "catalog");
const code = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code.replace("window.MS = window.MS || {};", "var MS = window.MS = window.MS || {};"), ctx);
const used = new Set();
for (const c of ctx.window.MS.categories) used.add(path.basename(c.image));
for (const p of ctx.window.MS.products) used.add(path.basename(p.image));

let kept = 0;
let removed = 0;
for (const f of fs.readdirSync(DIR)) {
  if (used.has(f)) {
    kept++;
    continue;
  }
  fs.unlinkSync(path.join(DIR, f));
  removed++;
}
console.log("kept", kept, "removed", removed);
