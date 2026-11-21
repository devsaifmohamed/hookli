// Cleanliness score (0–100) for the "one source of truth per hook" RFC
// (docs/plans/2026-11-21-single-source.md, "Cleanliness score").
//
//   node scripts/score.mjs --results scripts/cleanliness/before-results.json
//
// M1, M4 and M5 are static: read from the tables below and checked against the repo.
// M2 and M3 come from a results file (the before replay, later the scenario and mistake tests).
// When the layout changes, update FACTS / GENERATED_OUTPUTS / GENERATORS in the same PR:
// the script fails when a listed place no longer exists.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// M1: every hand-written place of the 6 facts in the RFC Problem table: [file, proof it is there].
// A hook file stands for all 66 hook files (it is one place per hook, like the manifest entry).
// Category counts every hand-written category list, so it is 7 here, not the RFC table's 3
// (the MCP README also names the categories in prose; prose is not counted).
// Not counted: tests and files no output reads (apps/docs/docs/DESIGN.md, packages/hookli/ROADMAP.md).
const HOOK_FILE = "packages/hookli/src/hooks/use-document-title/use-document-title.ts";
const FACTS = {
  description: [
    ["packages/hookli/hooks.manifest.json", /"description":/],
    [HOOK_FILE, /\/\*\*\n \* Keeps `document.title`/],
  ],
  signature: [
    [HOOK_FILE, /export const useDocumentTitle = \(/],
    ["packages/hookli/hooks.manifest.json", /"signature":/],
    ["apps/docs/lib/hook-docs.ts", /type: "UseDocumentTitleOptions"/],
  ],
  paramText: [
    [HOOK_FILE, /@param title -/],
    ["apps/docs/lib/hook-docs.ts", /parameters: \[\n\s+\{\n\s+name: "title",/],
  ],
  usage: [["apps/docs/lib/hook-docs.ts", /usage: `/]],
  category: [
    ["packages/hookli/hooks.manifest.json", /"category":/],
    ["packages/hookli/scripts/gen-readme.mjs", /CATEGORY_ORDER = \[/],
    ["apps/docs/lib/hooks-registry.ts", /CATEGORY_ORDER: readonly HookCategory\[\] = \[/],
    ["apps/docs/app/docs/page.tsx", /const CATEGORY_META: Record</],
    ["apps/docs/components/sidebar.tsx", /const CATEGORY_ICONS: Record<HookCategory/],
    ["packages/hookli-mcp/src/types.ts", /type HookCategory = "state"/],
    ["packages/hookli-mcp/src/tools/index.ts", /CategoryEnum = z\.enum\(\["state"/],
  ],
  keywords: [["packages/hookli/hooks.manifest.json", /"keywords":/]],
};

// M4: generator outputs. Files of one output are grouped (the README and its root mirror are one).
// Any tracked file whose first line starts a GENERATED comment is counted too, so a new output can't hide.
const GENERATED_OUTPUTS = [
  ["packages/hookli/README.md", "README.md"],
  ["apps/docs/lib/hook-sources.generated.ts"],
  ["packages/hookli-mcp/src/data/catalog.json"],
  ["packages/hookli-mcp/src/data/meta.json"],
  ["packages/hookli/generated/catalog.json"],
];
const GENERATED_MARKER = /^\s*(\/\*|\/\/|<!--)\s*GENERATED\b/;

// M5: scripts that write data the shipped outputs read (README, manifest, catalog, docs or MCP data).
// Not counted: scripts/render-banner.mjs (artwork), scripts/score.mjs, scripts/cleanliness/*, check scripts.
const GENERATORS = [
  "packages/hookli/scripts/gen-readme.mjs",
  "scripts/gen-hook-sources.mjs",
  "scripts/build-mcp-catalog.mjs",
  "packages/hookli/scripts/build-catalog.mjs",
];

// Frozen in the RFC "Scenarios" table (ideal hand edits per scenario).
const IDEAL_EDITS = { S1: 6, S3: 2, S4: 2, S5: 1, S6: 6, S7: 1, S8: 7 };
const MISTAKES = Array.from({ length: 15 }, (_, i) => `X${i + 1}`);
// X14 / X15 count as caught only when M1 shows a single copy of that fact (the bug can't exist).
const NEEDS_SINGLE_COPY = { X14: "signature", X15: "description" };

const WEIGHTS = { M1: 25, M2: 25, M3: 25, M4: 15, M5: 10 };
const IDEAL = { M1: 7, M4: 1, M5: 1 };

const args = process.argv.slice(2);
const resultsPath = args[args.indexOf("--results") + 1];
if (!args.includes("--results") || !resultsPath) {
  console.error("usage: node scripts/score.mjs --results <results.json>");
  process.exit(2);
}
const results = JSON.parse(fs.readFileSync(path.resolve(resultsPath), "utf8"));

const tracked = new Set(execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean));
const fail = (msg) => {
  console.error(`score: ${msg}`);
  process.exit(1);
};

// M1
const copies = {};
for (const [fact, places] of Object.entries(FACTS)) {
  for (const [file, proof] of places) {
    if (!tracked.has(file)) fail(`M1 table is stale: ${fact} lists ${file}, which is not tracked`);
    if (GENERATED_OUTPUTS.flat().includes(file)) fail(`M1 table is wrong: ${file} is generated, not hand-written`);
    if (!proof.test(read(file))) fail(`M1 table is stale: ${fact} is no longer in ${file} (${proof})`);
  }
  copies[fact] = places.length;
}
const m1 = Object.values(copies).reduce((a, b) => a + b, 0);

// M4
const outputs = GENERATED_OUTPUTS.filter((files) => files.some((f) => tracked.has(f))).map((files) => files.join(" + "));
for (const file of tracked) {
  if (GENERATED_OUTPUTS.flat().includes(file) || !fs.existsSync(path.join(root, file))) continue;
  const firstLine = read(file).slice(0, 200).split("\n")[0];
  if (GENERATED_MARKER.test(firstLine)) outputs.push(file);
}
const m4 = outputs.length;

// M5
const m5 = GENERATORS.filter((f) => tracked.has(f)).length;

// M2
const scenarios = Object.entries(IDEAL_EDITS).map(([id, ideal]) => {
  const r = results.scenarios?.[id];
  if (!r) fail(`results have no scenario ${id}`);
  if (!r.green) fail(`scenario ${id} did not reach its end state with CI green, so its count is invalid`);
  return { id, ideal, actual: r.edits, ratio: Math.min(1, ideal / r.edits) };
});
const m2Ratio = scenarios.reduce((a, s) => a + s.ratio, 0) / scenarios.length;

// M3
const caught = MISTAKES.filter((id) => {
  const r = results.mistakes?.[id];
  if (!r) fail(`results have no mistake ${id}`);
  const fact = NEEDS_SINGLE_COPY[id];
  return r.caught && (!fact || copies[fact] === 1);
});
const m3Ratio = caught.length / MISTAKES.length;

const points = {
  M1: Math.min(1, IDEAL.M1 / m1) * WEIGHTS.M1,
  M2: m2Ratio * WEIGHTS.M2,
  M3: m3Ratio * WEIGHTS.M3,
  M4: Math.min(1, IDEAL.M4 / Math.max(m4, 1)) * WEIGHTS.M4,
  M5: Math.min(1, IDEAL.M5 / Math.max(m5, 1)) * WEIGHTS.M5,
};
const total = Object.values(points).reduce((a, b) => a + b, 0);
const pts = (id) => `${points[id].toFixed(1)} / ${WEIGHTS[id]}`;

const rows = [
  ["M1 Copies per fact", `${m1} (${Object.entries(copies).map(([f, n]) => `${f} ${n}`).join(", ")})`, IDEAL.M1, pts("M1")],
  ["M2 Hand edits per scenario", scenarios.map((s) => `${s.id} ${s.actual}`).join(", "), scenarios.map((s) => `${s.id} ${s.ideal}`).join(", "), pts("M2")],
  ["M3 Mistakes caught", `${caught.length}/15 (${caught.join(", ") || "none"})`, "15/15", pts("M3")],
  ["M4 Committed generated files", `${m4} (${outputs.join("; ")})`, IDEAL.M4, pts("M4")],
  ["M5 Generator scripts", m5, IDEAL.M5, pts("M5")],
];
console.log(`## Cleanliness score: ${total.toFixed(1)} / 100\n`);
console.log(`Results: \`${resultsPath}\` (measured on ${results.commit?.slice(0, 7) ?? "?"})\n`);
console.log("| Metric | Actual | Ideal | Points |\n|---|---|---|---|");
for (const row of rows) console.log(`| ${row.join(" | ")} |`);
console.log(`| **Total** | | | **${total.toFixed(1)} / 100** |`);
