/*
 * Proves every "Open in StackBlitz" playground works: generates the project for
 * each hook exactly as the docs button does, installs the template's
 * dependencies once, then runs `tsc` and a production `vite build` on every
 * project. Exits non-zero if any playground fails.
 *
 *   pnpm --filter hookli-docs run check:playgrounds      (needs `hookli` built)
 *   KEEP=1 ...   keeps the temp folder for inspection
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

type Mod = Record<string, unknown>;
// The docs modules load as CommonJS under tsx; read named exports either way.
const load = async (spec: string): Promise<Mod> => {
  const mod = (await import(spec)) as Mod & { default?: Mod };
  return mod.default && Object.keys(mod).length === 1 ? mod.default : mod;
};

const { HOOKS } = (await load("@/lib/hooks-registry")) as { HOOKS: Array<{ slug: string; name: string }> };
const { getHookDoc } = (await load("@/lib/hook-docs")) as { getHookDoc: (slug: string) => unknown };
const { getHookSource, getHookSourceClosure } = await load("@/lib/hook-sources");
const { createStackBlitzProject } = (await load("@/lib/stackblitz")) as {
  createStackBlitzProject: (hook: unknown, doc: unknown, sources: unknown) => { files: Record<string, string> };
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hookli-playgrounds-"));
const projectsDir = path.join(tmp, "projects");
let template: { dependencies: Record<string, string>; devDependencies: Record<string, string> } | undefined;
const missingDocs: string[] = [];

for (const hook of HOOKS) {
  const doc = getHookDoc(hook.slug);
  if (!doc) {
    missingDocs.push(hook.slug);
    continue;
  }
  const project = createStackBlitzProject(hook, doc, { get: getHookSource, closure: getHookSourceClosure });
  for (const [file, contents] of Object.entries(project.files)) {
    const dest = path.join(projectsDir, hook.slug, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents);
  }
  template ??= JSON.parse(project.files["package.json"]);
}

if (!template) throw new Error("no playgrounds generated");
fs.writeFileSync(
  path.join(tmp, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies: { ...template.dependencies, ...template.devDependencies } }),
);
console.log(`Installing playground template dependencies in ${tmp} ...`);
execFileSync("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: tmp, stdio: "inherit" });

const bin = (name: string) => path.join(tmp, "node_modules", ".bin", name);
const failures: string[] = [];
const slugs = fs.readdirSync(projectsDir).sort();
for (const slug of slugs) {
  const dir = path.join(projectsDir, slug);
  fs.symlinkSync(path.join(tmp, "node_modules"), path.join(dir, "node_modules"));
  for (const [step, cmd, args] of [
    ["tsc", bin("tsc"), ["-p", "tsconfig.json"]],
    ["vite build", bin("vite"), ["build", "--logLevel", "error"]],
  ] as const) {
    try {
      execFileSync(cmd, [...args], { cwd: dir, stdio: "pipe" });
    } catch (error) {
      const out = String((error as { stdout?: Buffer }).stdout ?? "") + String((error as { stderr?: Buffer }).stderr ?? "");
      failures.push(`${slug} (${step}):\n    ${out.trim().split("\n").slice(0, 4).join("\n    ")}`);
    }
  }
}

console.log(`\nPlaygrounds: ${slugs.length} checked, ${failures.length} failing steps, ${missingDocs.length} hooks without docs.`);
if (missingDocs.length) console.log(`No docs entry (no playground button): ${missingDocs.join(", ")}`);
for (const f of failures) console.log(`  FAIL ${f}`);
if (!process.env.KEEP) fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failures.length || missingDocs.length ? 1 : 0);
