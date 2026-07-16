// Regenerate the README's "Available hooks" list + hook-count badge from the
// single source of truth: hooks.manifest.json. Run via `pnpm --filter hookli gen:manifest`
// (also runs on prepublishOnly). Do NOT hand-edit the generated list.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { hooks } = JSON.parse(readFileSync(join(root, "hooks.manifest.json"), "utf8"));
const count = hooks.length;

const readmePath = join(root, "README.md");
let md = readFileSync(readmePath, "utf8");

// 1) hook-count badge (e.g. .../badge/40_hooks-003748... alt="40 hooks")
md = md.replace(/badge\/\d+_hooks-/g, `badge/${count}_hooks-`);
md = md.replace(/alt="\d+ hooks"/g, `alt="${count} hooks"`);

// 2) the "Available hooks" bullet block (a contiguous run of `- **[`useX`](…)** — …` lines)
const list = hooks
  .map((h) => `- **[\`${h.name}\`](https://hookli.vercel.app/docs/${h.slug})** — ${h.description}`)
  .join("\n");
const block = /(?:^- \*\*\[`use.*\r?\n?)+/m;
if (!block.test(md)) throw new Error("gen-readme: could not find the hook bullet block in README.md");
md = md.replace(block, list + "\n");

writeFileSync(readmePath, md);
console.log(`README regenerated from manifest — ${count} hooks.`);
