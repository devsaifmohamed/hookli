// Starts a new hook: writes the hook with a TSDoc template, its test (with the SSR case),
// its folder barrel and the barrel line, plus a working docs demo and its demo-map line.
// Every TODO fails the strict build until it is replaced.
//
//   pnpm new:hook use-x
//   node scripts/new-hook.mjs use-x [--root <package dir>] [--docs <docs app dir>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FENCE = "```";

const camel = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const pascal = (name) => name[0].toUpperCase() + name.slice(1);

export function hookFiles(slug) {
  const name = camel(slug);
  const demo = `${pascal(name)}DocDemo`;
  const hook = `import { useState } from "react";

/**
 * TODO: one sentence that says what ${name} does. It is the summary on npm, the docs and the MCP.
 *
 * TODO: behaviour, SSR notes and edge cases, or delete this paragraph.
 *
 * @category TODO: state, effects, dom or data (see catalog/categories.json)
 * @keywords TODO: comma-separated phrases people search for
 * @param initialValue - TODO: what the name and type don't say, or delete this line.
 * @returns value - TODO: what the hook returns.
 *
 * @example Usage
 * ${FENCE}tsx
 * import { ${name} } from "hookli";
 *
 * export function Demo() {
 *   const value = ${name}(0);
 *
 *   return <p>{value}</p>;
 * }
 * ${FENCE}
 */
export function ${name}<T>(initialValue: T): T {
  const [value] = useState(initialValue);
  return value;
}
`;
  const test = `import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ${name} } from "./${slug}";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("${name}", () => {
  it("returns the initial value", () => {
    const { result } = renderHook(() => ${name}(1));
    expect(result.current).toBe(1);
  });
});

describe("${name} on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("${name}", 1);
  });
});
`;
  const demoFile = `"use client";

import { ${name} } from "hookli";
import { DemoReadout } from "./ui";

export function ${demo}() {
  const value = ${name}(0);

  return (
    <dl>
      <DemoReadout label="value">{String(value)}</DemoReadout>
    </dl>
  );
}
`;
  return { name, demo, hook, test, demoFile };
}

/** Inserts `line` into the block of lines matching `pattern`, keeping it sorted. */
function insertSorted(text, line, pattern) {
  const lines = text.split("\n");
  const block = lines.map((l, i) => [l, i]).filter(([l]) => pattern.test(l));
  if (!block.length) throw new Error(`new:hook: no line matching ${pattern} to insert next to`);
  const after = block.filter(([l]) => l.localeCompare(line) < 0).at(-1);
  lines.splice(after ? after[1] + 1 : block[0][1], 0, line);
  return lines.join("\n");
}

export function newHook(slug, { root = PACKAGE_ROOT, docs = path.join(PACKAGE_ROOT, "..", "..", "apps", "docs") } = {}) {
  if (!/^use-[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`new:hook: "${slug}" must be kebab-case and start with use- (for example use-thing)`);
  const folder = path.join(root, "src", "hooks", slug);
  if (fs.existsSync(folder)) throw new Error(`new:hook: ${path.relative(process.cwd(), folder)} already exists`);
  const { name, demo, hook, test, demoFile } = hookFiles(slug);

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, `${slug}.ts`), hook);
  fs.writeFileSync(path.join(folder, `${slug}.test.ts`), test);
  fs.writeFileSync(path.join(folder, "index.ts"), `export * from "./${slug}";\n`);
  const barrel = path.join(root, "src", "hooks", "index.ts");
  fs.appendFileSync(barrel, `export * from "./${slug}";\n`);

  const demos = path.join(docs, "components", "demos");
  fs.writeFileSync(path.join(demos, `${slug}-demo.tsx`), demoFile);
  const map = path.join(demos, "index.ts");
  let text = fs.readFileSync(map, "utf8");
  text = insertSorted(text, `import { ${demo} } from "./${slug}-demo";`, /^import \{ \w+ \} from "\.\/use-/);
  text = insertSorted(text, `  "${slug}": ${demo},`, /^ {2}"use-[a-z0-9-]+": \w+,$/);
  fs.writeFileSync(map, text);
  return { name, files: [`${slug}.ts`, `${slug}.test.ts`, "index.ts"].map((f) => path.join(folder, f)) };
}

function main(argv) {
  const flag = (f) => (argv.includes(f) ? path.resolve(argv[argv.indexOf(f) + 1]) : undefined);
  const slug = argv.find((a, i) => !a.startsWith("--") && !["--root", "--docs"].includes(argv[i - 1]));
  if (!slug) throw new Error("usage: pnpm new:hook use-x");
  const { name } = newHook(slug, { root: flag("--root"), docs: flag("--docs") });
  console.log(`new:hook: wrote ${slug} (hook, test, folder barrel, barrel line, demo, demo-map line).
Next:
  1. Write ${name} and replace every TODO in its TSDoc (the strict build fails on them).
  2. Make the demo show the hook (apps/docs/components/demos/${slug}-demo.tsx).
  3. Add a search case for ${name} to packages/hookli-mcp/test/search-cases.ts (TUNING_CASES).
Then run pnpm build && pnpm test.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
