// Diff every t("...") key used in app/ + components/ against en.json.
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const en = JSON.parse(readFileSync("messages/en.json", "utf8")) as Record<string, string>;

const used = new Set<string>();
function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(f)) {
      const src = readFileSync(p, "utf8");
      for (const m of src.matchAll(/\bt\(\s*"([a-z0-9_.]+)"/g)) used.add(m[1]);
    }
  }
}
walk("app");
walk("components");
walk("lib");

// Real keys are namespaced ("nav.stone") — bare words are doc examples.
const missing = [...used].filter((k) => k.includes(".") && !(k in en)).sort();
console.log("keys used:", used.size, "| missing from en.json:", missing.length);
missing.forEach((k) => console.log(" -", k));
if (missing.length > 0) process.exit(1);
