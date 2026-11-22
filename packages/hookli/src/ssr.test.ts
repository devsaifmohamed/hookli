import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as hookli from "./index";

// Each hook's SSR case lives in its own test; this guard fails when a new hook has none.
describe("SSR coverage", () => {
  it("every exported hook has an expectSSRSafe case in its own test", () => {
    const hooksDir = join(__dirname, "hooks");
    const covered = new Set<string>();
    for (const folder of readdirSync(hooksDir, { withFileTypes: true })) {
      if (!folder.isDirectory()) continue;
      const test = readFileSync(join(hooksDir, folder.name, `${folder.name}.test.ts`), "utf8");
      for (const [, name] of test.matchAll(/expectSSRSafe\("(\w+)"/g)) covered.add(name);
    }
    const hooks = Object.entries(hookli).filter(([name, value]) => /^use[A-Z]/.test(name) && typeof value === "function");
    const uncovered = hooks.filter(([name, fn]) => !covered.has(name) && !hooks.some(([other, otherFn]) => other !== name && otherFn === fn && covered.has(other)));
    expect(uncovered.map(([name]) => name)).toEqual([]);
  });
});
