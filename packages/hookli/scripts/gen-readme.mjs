// Regenerate the README's category-grouped hook index + hook-count badge from the
// single source of truth: hooks.manifest.json. Run via `pnpm --filter hookli gen:manifest`
// (also runs on prepublishOnly). Do NOT hand-edit the generated index — everything
// between the HOOKS:START / HOOKS:END markers is overwritten.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { hooks } = JSON.parse(readFileSync(join(root, "hooks.manifest.json"), "utf8"));
const count = hooks.length;

// Category order + labels mirror apps/docs/lib/hooks-registry.ts (CATEGORY_ORDER / CATEGORY_LABELS).
const CATEGORY_ORDER = ["state", "effects", "dom", "data"];
const CATEGORY_LABELS = { state: "State", effects: "Effects", dom: "DOM", data: "Data" };

const readmePath = join(root, "README.md");
let md = readFileSync(readmePath, "utf8");

// 1) hook-count badge (e.g. .../badge/40_hooks-23272F... alt="40 hooks")
md = md.replace(/badge\/\d+_hooks-/g, `badge/${count}_hooks-`);
md = md.replace(/alt="\d+ hooks"/g, `alt="${count} hooks"`);

// 2) the category-grouped hook index, between the HOOKS:START / HOOKS:END markers.
//    A hook whose category is not one we know would be silently dropped — fail loudly.
const known = new Set(CATEGORY_ORDER);
const orphan = hooks.find((h) => !known.has(h.category));
if (orphan) {
  throw new Error(`gen-readme: hook "${orphan.name}" has unknown category "${orphan.category}"`);
}

const bullet = (h) =>
  `- **[\`${h.name}\`](https://hookli.vercel.app/docs/${h.slug})** — ${h.description}`;
const grouped = CATEGORY_ORDER.map((cat) => {
  const items = hooks.filter((h) => h.category === cat);
  return `### ${CATEGORY_LABELS[cat]} (${items.length})\n\n${items.map(bullet).join("\n")}`;
}).join("\n\n");

const region = /(<!-- HOOKS:START[\s\S]*?-->)[\s\S]*?(<!-- HOOKS:END -->)/;
if (!region.test(md)) {
  throw new Error("gen-readme: could not find the HOOKS:START / HOOKS:END markers in README.md");
}
md = md.replace(region, `$1\n\n${grouped}\n\n$2`);

writeFileSync(readmePath, md);

// 3) mirror to the REPO ROOT — the GitHub repo page should show the package README
//    (the repo IS the package). Generated copy, never hand-edited: edit
//    packages/hookli/README.md and re-run this script.
const repoRootReadme = join(root, "..", "..", "README.md");
const banner =
  "<!-- GENERATED — do not edit. Source: packages/hookli/README.md (run `pnpm gen:manifest`). -->\n\n";
writeFileSync(repoRootReadme, banner + md);

console.log(`README regenerated from manifest — ${count} hooks (package + repo root).`);
