// Packs the library exactly as `npm publish` would and fails if the tarball is missing a
// file consumers import: the bundles, the types, or the built manifest (`hookli/manifest`).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: root, encoding: "utf8" }));
const files = new Set(pack.files.map((f) => f.path));
const required = ["dist/index.js", "dist/index.mjs", "dist/index.d.ts", "hooks.manifest.json", "README.md", "CHANGELOG.md"];
const missing = required.filter((f) => !files.has(f));
if (missing.length) {
  console.error(`test:package: the ${pack.name} tarball is missing ${missing.join(", ")}. Run pnpm --filter hookli build first.`);
  process.exit(1);
}
console.log(`test:package: ${pack.name}@${pack.version} has ${files.size} files, including ${required.join(", ")}.`);
