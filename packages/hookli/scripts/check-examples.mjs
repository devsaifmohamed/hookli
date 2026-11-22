// Type-checks every `@example` code block in generated/catalog.json against the library
// (mistake X8, docs/plans/2026-11-21-single-source.md §3). Each block is written to
// generated/examples/<slug>-<n>.tsx as its own module, `hookli` resolves to src/index.ts,
// and any type error fails with `use-x: <field>: line N: <error>`.
//
//   node scripts/build-catalog.mjs && node scripts/check-examples.mjs
//   node scripts/check-examples.mjs [--root <dir>]     checks an existing catalog
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { compilerOptions } from "./build-catalog.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function checkExamples(packageRoot = PACKAGE_ROOT) {
  const root = fs.realpathSync(packageRoot);
  const catalogPath = path.join(root, "generated", "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    throw new Error("examples:check: generated/catalog.json is missing. Run `node scripts/build-catalog.mjs`.");
  }
  const { hooks } = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  const dir = path.join(root, "generated", "examples");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const blocks = new Map();
  for (const hook of hooks) {
    const codes = [["usage", hook.usage], ...hook.examples.map((example, i) => [`examples[${i}]`, example.code])];
    codes.forEach(([field, code], n) => {
      if (!code) return;
      const file = path.join(dir, `${hook.slug}-${n}.tsx`);
      fs.writeFileSync(file, code);
      blocks.set(file, { slug: hook.slug, field });
    });
  }
  if (!blocks.size) return { count: 0, problems: [] };

  const program = ts.createProgram([...blocks.keys()], {
    ...compilerOptions(root),
    baseUrl: root,
    paths: { hookli: ["src/index.ts"] },
    // Every block is its own module, even one with no import or export.
    moduleDetection: ts.ModuleDetectionKind.Force,
  });
  const problems = ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file && blocks.has(path.resolve(d.file.fileName)))
    .map((d) => {
      const { slug, field } = blocks.get(path.resolve(d.file.fileName));
      const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
      return `${slug}: ${field}: line ${line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`;
    });
  return { count: blocks.size, problems };
}

function main(argv) {
  const rootFlag = argv.indexOf("--root");
  const { count, problems } = checkExamples(rootFlag >= 0 ? path.resolve(argv[rootFlag + 1]) : PACKAGE_ROOT);
  if (problems.length) {
    console.error(`examples:check: ${problems.length} error(s) in ${count} example(s)\n  ${problems.join("\n  ")}`);
    process.exitCode = 1;
  } else {
    console.log(`examples:check: ${count} example(s) type-check against the library`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
