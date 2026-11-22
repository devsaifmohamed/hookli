// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";
import { buildCatalog } from "./build-catalog.mjs";
import { checkExamples } from "./check-examples.mjs";
import { newHook } from "./new-hook.mjs";

const PKG = fileURLToPath(new URL("..", import.meta.url));
const DEMOS = path.join(PKG, "..", "..", "apps", "docs", "components", "demos");

/* A copy of the library (src, catalog, configs) and of the docs demo map, in a temp dir. */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hookli-new-hook-"));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
const root = path.join(tmp, "hookli");
const docs = path.join(tmp, "docs");
for (const entry of ["src", "catalog", "package.json", "tsconfig.json"]) fs.cpSync(path.join(PKG, entry), path.join(root, entry), { recursive: true });
fs.symlinkSync(path.join(PKG, "node_modules"), path.join(root, "node_modules"), "dir");
// The barrel without its final newline: the starter must not glue its line onto the last one.
const barrel = path.join(root, "src", "hooks", "index.ts");
fs.writeFileSync(barrel, fs.readFileSync(barrel, "utf8").trimEnd());
fs.mkdirSync(path.join(docs, "components", "demos"), { recursive: true });
fs.copyFileSync(path.join(DEMOS, "index.ts"), path.join(docs, "components", "demos", "index.ts"));

const read = (...parts: string[]) => fs.readFileSync(path.join(...parts), "utf8");
const typeErrors = () => {
  const config = ts.getParsedCommandLineOfConfigFile(path.join(root, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })!;
  const program = ts.createProgram(config.fileNames, { ...config.options, noEmit: true });
  return ts.getPreEmitDiagnostics(program).map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "));
};

describe("pnpm new:hook", () => {
  newHook("use-thing", { root, docs });
  const hookFile = path.join(root, "src", "hooks", "use-thing", "use-thing.ts");

  it("writes the hook, its test, its folder barrel and the barrel line", () => {
    expect(read(hookFile)).toContain("export function useThing<T>(initialValue: T): T");
    expect(read(root, "src", "hooks", "use-thing", "use-thing.test.ts")).toContain('await expectSSRSafe("useThing", 1);');
    expect(read(root, "src", "hooks", "use-thing", "index.ts")).toBe('export * from "./use-thing";\n');
    const lines = read(barrel).trim().split("\n");
    expect(lines.at(-1)).toBe('export * from "./use-thing";');
    expect(lines.at(-2)).toMatch(/^export \* from "\.\/use-[a-z-]+";$/);
  });

  it("writes a demo and its map line, sorted with the others", () => {
    expect(read(docs, "components", "demos", "use-thing-demo.tsx")).toContain("export function UseThingDocDemo()");
    const map = read(docs, "components", "demos", "index.ts");
    expect(map).toContain('import { UseThingDocDemo } from "./use-thing-demo";');
    expect(map).toMatch(/"use-text-selection": UseTextSelectionDocDemo,\n {2}"use-thing": UseThingDocDemo,\n {2}"use-throttle"/);
  });

  it("refuses a name that isn't use-kebab-case, or a hook that exists", () => {
    expect(() => newHook("useThing", { root, docs })).toThrow("must be kebab-case");
    expect(() => newHook("use-thing", { root, docs })).toThrow("already exists");
  });

  it("the TODO placeholders fail the strict generator, naming each field", () => {
    const problems = buildCatalog(root).problems.filter((p) => p.startsWith("use-thing:"));
    for (const field of ["summary", "details", "category", "keywords", "parameters", "returns"]) {
      expect(problems.some((p) => p.startsWith(`use-thing: ${field}:`)), field).toBe(true);
    }
  });

  it("once the TODOs are replaced it passes the strict generator, examples:check and typecheck", () => {
    const filled = read(hookFile)
      .replace(/ \* TODO: one sentence[^\n]*/, " * Keeps the value it was first given.")
      .replace(/ \*\n \* TODO: behaviour[^\n]*/, "")
      .replace(/@category TODO[^\n]*/, "@category state")
      .replace(/@keywords TODO[^\n]*/, "@keywords first value, initial value")
      .replace(/ \* @param initialValue - TODO[^\n]*\n/, "")
      .replace(/@returns value - TODO[^\n]*/, "@returns value - The value from the first render.");
    fs.writeFileSync(hookFile, filled);
    const { catalog, problems } = buildCatalog(root);
    expect(problems).toEqual([]);
    expect(catalog.hooks.find((h) => h.slug === "use-thing")?.summary).toBe("Keeps the value it was first given.");
    fs.mkdirSync(path.join(root, "generated"), { recursive: true });
    fs.writeFileSync(path.join(root, "generated", "catalog.json"), JSON.stringify(catalog));
    expect(checkExamples(root).problems.filter((p) => p.startsWith("use-thing:"))).toEqual([]);
    expect(typeErrors()).toEqual([]);
  }, 60_000);
});
