/** Список разделов в middleware продублирован ради размера бандла — следим, чтобы он не устарел. */
import { readFileSync } from "node:fs";

const middleware = readFileSync(new URL("../src/middleware.ts", import.meta.url), "utf8");
const { categories } = JSON.parse(
  readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"),
);

const listed = [...middleware.matchAll(/^\s*"([a-z-]+)",$/gm)].map((m) => m[1]);
const actual = categories.map((c) => c.id);

const missing = actual.filter((id) => !listed.includes(id));
const extra = listed.filter((id) => !actual.includes(id));

if (missing.length || extra.length) {
  if (missing.length) console.error("Нет в middleware:", missing.join(", "));
  if (extra.length) console.error("Лишние в middleware:", extra.join(", "));
  process.exit(1);
}
console.log(`Разделы совпадают: ${actual.length}`);
