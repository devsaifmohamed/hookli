// @vitest-environment node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { buildCatalog, manifestOf, readmeOf } from "./build-catalog.mjs";
import { checkExamples } from "./check-examples.mjs";

const PKG = fileURLToPath(new URL("..", import.meta.url));
const FENCE = "```";

/** A TSDoc block from its lines. */
const doc = (...lines: string[]) => ["/**", ...lines.map((l) => ` *${l ? ` ${l}` : ""}`), " */"].join("\n");

/** A hook that passes every check: summary, category, keywords, @param, @returns, usage. */
const completeHook = (name: string, overrides: { tags?: string[]; params?: string; body?: string } = {}) => {
  const tags = overrides.tags ?? [
    "@category state",
    `@keywords ${name}, thing`,
    "@param initial - The first value.",
    "@returns value - The current value.",
  ];
  return `import { useState } from "react";

${doc(
  `Keeps a number for ${name}.`,
  "",
  "Longer details about it.",
  "",
  ...tags,
  "",
  "@example Usage",
  `${FENCE}tsx`,
  `import { ${name} } from "hookli";`,
  `export const Demo = () => <p>{${name}(1)}</p>;`,
  FENCE,
)}
export const ${name} = (${overrides.params ?? "initial: number"}): number => {
  ${overrides.body ?? "const [value] = useState(initial);\n  return value;"}
};
`;
};

type Fixture = {
  hooks: Record<string, string>;
  barrel?: string[];
  folderIndex?: Record<string, string>;
  categories?: { id: string; label: string }[];
  removed?: unknown[];
};

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

/** Writes a package root with src/hooks/<slug>/ folders in a temp dir. */
function makeFixture({ hooks, barrel = Object.keys(hooks), folderIndex = {}, categories, removed = [] }: Fixture) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hookli-catalog-"));
  roots.push(root);
  const write = (rel: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  fs.symlinkSync(path.join(PKG, "node_modules"), path.join(root, "node_modules"), "dir");
  write("package.json", JSON.stringify({ name: "hookli", version: "9.9.9" }));
  write("catalog/categories.json", JSON.stringify(categories ?? [{ id: "state", label: "State" }]));
  write("catalog/removed-hooks.json", JSON.stringify(removed));
  write("src/index.ts", 'export * from "./hooks";\n');
  write("src/hooks/index.ts", barrel.map((slug) => `export * from "./${slug}";\n`).join(""));
  for (const [slug, source] of Object.entries(hooks)) {
    write(`src/hooks/${slug}/${slug}.ts`, source);
    write(`src/hooks/${slug}/index.ts`, folderIndex[slug] ?? `export * from "./${slug}";\n`);
  }
  return root;
}

const build = (fixture: Fixture) => buildCatalog(makeFixture(fixture));
const hookOf = (fixture: Fixture, name: string) => build(fixture).catalog.hooks.find((h) => h.name === name);

const run = (script: string, ...args: string[]) => {
  const result = spawnSync(process.execPath, [path.join(PKG, "scripts", script), ...args], { encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
};

describe("build-catalog: extraction rules", () => {
  it("extracts a plain hook with every field, and no problems", () => {
    const root = makeFixture({ hooks: { "use-thing": completeHook("useThing") } });
    const { catalog, problems } = buildCatalog(root);
    expect(problems).toEqual([]);
    expect(catalog.libraryVersion).toBe("9.9.9");
    expect(catalog.categories).toEqual([{ id: "state", label: "State" }]);
    expect(catalog.removed).toEqual([]);
    expect(catalog.hooks).toHaveLength(1);
    const [hook] = catalog.hooks;
    expect(hook).toMatchObject({
      slug: "use-thing",
      name: "useThing",
      summary: "Keeps a number for useThing.",
      details: "Longer details about it.",
      category: "state",
      keywords: ["useThing", "thing"],
      signature: "useThing(initial: number): number",
      parameters: [{ name: "initial", type: "number", defaultValue: null, description: "The first value." }],
      returns: [{ name: "value", type: "number", description: "The current value." }],
      typeAliases: [],
      usage: 'import { useThing } from "hookli";\nexport const Demo = () => <p>{useThing(1)}</p>;',
      examples: [],
      aliases: [],
      sourcePath: "packages/hookli/src/hooks/use-thing/use-thing.ts",
      deps: [],
    });
    expect(hook.source).toBe(fs.readFileSync(path.join(root, "src/hooks/use-thing/use-thing.ts"), "utf8"));
  });

  it("puts each overload on its own line, reads TSDoc from the first, and supports export { x }", () => {
    const source = `${doc(
      "Listens to something.",
      "@param eventName - The event.",
      "@param target - Where to listen.",
    )}
function useListen(eventName: "a", target: Window): void;
function useListen(
  eventName: "b",
  target?: undefined,
): void;
function useListen(eventName: string, target?: Window): void {}

export { useListen };
`;
    const hook = hookOf({ hooks: { "use-listen": source } }, "useListen");
    expect(hook?.signature).toBe('useListen(eventName: "a", target: Window): void\nuseListen(eventName: "b", target?: undefined): void');
    expect(hook?.summary).toBe("Listens to something.");
    expect(hook?.parameters).toEqual([
      { name: "eventName", type: '"a" | "b"', defaultValue: null, description: "The event." },
      { name: "target", type: "Window | undefined", defaultValue: null, description: "Where to listen." },
    ]);
  });

  it("types `@returns [n] name` rows from the tuple member, through a type alias", () => {
    const source = `export type FlipReturn = [boolean, () => void];
${doc(
      "Flips a flag.",
      "@param initial - Start value. Defaults to `false`.",
      "@returns [0] value - The flag.",
      "@returns [1] toggle - Flips it.",
    )}
export const useFlip = (initial: boolean = false): FlipReturn => [initial, () => {}];
`;
    const hook = hookOf({ hooks: { "use-flip": source } }, "useFlip");
    expect(hook?.returns).toEqual([
      { name: "[0] value", type: "boolean", description: "The flag." },
      { name: "[1] toggle", type: "() => void", description: "Flips it." },
    ]);
    expect(hook?.parameters[0]).toMatchObject({ name: "initial", type: "boolean", defaultValue: "false" });
    expect(hook?.signature).toBe("useFlip(initial: boolean = false): FlipReturn");
  });

  it("types `@returns name` rows from the returned object's property", () => {
    const source = `export interface CounterReturn {
  count: number;
  reset(): void;
}
${doc("Counts.", "@returns count - The count.", "@returns reset - Back to zero.")}
export const useCount = (): CounterReturn => ({ count: 0, reset() {} });
`;
    const hook = hookOf({ hooks: { "use-count": source } }, "useCount");
    expect(hook?.returns).toEqual([
      { name: "count", type: "number", description: "The count." },
      { name: "reset", type: "() => void", description: "Back to zero." },
    ]);
  });

  it("types a lone `@returns name` row that is no property as the whole return type", () => {
    const source = `export interface CounterReturn {
  count: number;
}
${doc("Counts.", "@returns counter - The count and its actions.")}
export const useCount = (): CounterReturn => ({ count: 0 });
`;
    const { catalog, problems } = build({ hooks: { "use-count": source } });
    expect(catalog.hooks[0].returns).toEqual([{ name: "counter", type: "CounterReturn", description: "The count and its actions." }]);
    expect(problems.filter((p) => p.includes("returns"))).toEqual([]);
  });

  it("lists every member of an object return, with the member's TSDoc when it has one", () => {
    const source = `export interface CounterReturn {
  /** Never below zero. */
  count: number;
  reset(): void;
}
${doc("Counts.", "@param start")}
export const useCount = (start: number): CounterReturn => ({ count: start, reset() {} });
`;
    const { catalog, problems } = build({ hooks: { "use-count": source } });
    expect(catalog.hooks[0].returns).toEqual([
      { name: "count", type: "number", description: "Never below zero." },
      { name: "reset", type: "() => void", description: "" },
    ]);
    expect(catalog.hooks[0].parameters[0]).toMatchObject({ name: "start", description: "" });
    expect(problems.filter((p) => /returns|parameters/.test(p))).toEqual([]);
  });

  it("names tuple rows from the type's labels, and reports an unnamed member", () => {
    const labelled = `${doc("Flips a flag.")}
export const useFlip = (): [value: boolean, toggle: () => void] => [false, () => {}];
`;
    expect(hookOf({ hooks: { "use-flip": labelled } }, "useFlip")?.returns).toEqual([
      { name: "[0] value", type: "boolean", description: "" },
      { name: "[1] toggle", type: "() => void", description: "" },
    ]);
    const unnamed = labelled.replace("[value: boolean, toggle: () => void]", "[boolean, () => void]");
    expect(build({ hooks: { "use-flip": unnamed } }).problems).toContain(
      'use-flip: returns: tuple member 0 has no name: label it in the type or add "@returns [0] name"',
    );
  });

  it("reports a `@returns name` row that is no property when there are several rows", () => {
    const source = `export interface CounterReturn {
  count: number;
}
${doc("Counts.", "@returns count - The count.", "@returns bogus - Not there.")}
export const useCount = (): CounterReturn => ({ count: 0 });
`;
    expect(build({ hooks: { "use-count": source } }).problems).toContain('use-count: returns: "bogus" is not a property of the return type');
  });

  it("follows unexported local types transitively, in first-seen order, with dotted nested rows", () => {
    const source = `${doc("Where am I.")}
interface GeoError {
  /** The error code. */
  code: number;
}
type GeoPosition = {
  coords: {
    /** Latitude in degrees. */
    latitude: number;
    longitude: number;
  };
};
interface GeoState {
  location: GeoPosition | null;
  error: GeoError | null;
}
export const useGeo = (): GeoState => ({ location: null, error: null });
`;
    const hook = hookOf({ hooks: { "use-geo": source } }, "useGeo");
    expect(hook?.typeAliases.map((a) => a.name)).toEqual(["GeoState", "GeoPosition", "GeoError"]);
    expect(hook?.typeAliases[1].rows).toEqual([
      { name: "coords.latitude", type: "number", defaultValue: null, description: "Latitude in degrees." },
      { name: "coords.longitude", type: "number", defaultValue: null, description: "" },
    ]);
    expect(hook?.typeAliases[2].rows[0]).toEqual({ name: "code", type: "number", defaultValue: null, description: "The error code." });
  });

  it("makes a union alias one `value` row: the summary describes the alias, the rest the row", () => {
    const source = `${doc("Picks a mode.", "@param mode - The mode.")}
${doc("The three possible modes.", "", '"system" follows the OS.')}
export type Mode =
  | "system"
  | "dark"
  | "light";
export const useMode = (mode: Mode): Mode => mode;
`;
    const hook = hookOf({ hooks: { "use-mode": source } }, "useMode");
    expect(hook?.typeAliases).toEqual([
      {
        name: "Mode",
        description: "The three possible modes.",
        rows: [{ name: "value", type: '"system" | "dark" | "light"', defaultValue: null, description: '"system" follows the OS.' }],
      },
    ]);
  });

  it("makes a call signature a `(...args)` row and keeps the alias generics", () => {
    const source = `${doc("Wraps a function.", "@param fn - The function.")}
${doc("A wrapped function.")}
export interface Wrapped<Args extends unknown[], R> {
  (...args: Args): R | undefined;
  /** Cancel it. */
  cancel: () => void;
}
export const useWrap = <Args extends unknown[], R>(fn: (...args: Args) => R): Wrapped<Args, R> =>
  Object.assign((...args: Args) => fn(...args), { cancel: () => {} });
`;
    const hook = hookOf({ hooks: { "use-wrap": source } }, "useWrap");
    expect(hook?.signature).toBe("useWrap<Args extends unknown[], R>(fn: (...args: Args) => R): Wrapped<Args, R>");
    expect(hook?.typeAliases).toEqual([
      {
        name: "Wrapped<Args, R>",
        description: "A wrapped function.",
        rows: [
          { name: "(...args)", type: "(...args: Args) => R | undefined", defaultValue: null, description: "" },
          { name: "cancel", type: "() => void", defaultValue: null, description: "Cancel it." },
        ],
      },
    ]);
  });

  it("turns `Defaults to …` into defaultValue, drops it from the row text and marks `?` members optional", () => {
    const source = `${doc("Takes options.", "@param options - The options.")}
export interface Options {
  /** Run on the leading edge. Defaults to \`false\`. */
  leading?: boolean;
  /** Suffix to add. Defaults to \`"…"\`. */
  suffix?: string;
}
export const useOpts = (options: Options = {}): void => {};
`;
    const hook = hookOf({ hooks: { "use-opts": source } }, "useOpts");
    expect(hook?.parameters[0]).toMatchObject({ name: "options", type: "Options", defaultValue: "{}" });
    expect(hook?.typeAliases[0].rows).toEqual([
      { name: "leading", type: "boolean", defaultValue: "false", description: "Run on the leading edge.", optional: true },
      { name: "suffix", type: "string", defaultValue: '"…"', description: "Suffix to add.", optional: true },
    ]);
  });

  it("resolves a type imported from a sibling hook and records the sibling as a dep", () => {
    const base = `export interface BaseOptions {
  /** How long. */
  delay: number;
}
${doc("Base hook.", "@param options - Options.")}
export const useBase = (options: BaseOptions): void => {};
`;
    const derived = `import { useBase, type BaseOptions } from "../use-base";

${doc("Derived hook.", "@param options - Options.")}
export const useDerived = (options: BaseOptions): void => useBase(options);
`;
    const hook = hookOf({ hooks: { "use-base": base, "use-derived": derived } }, "useDerived");
    expect(hook?.deps).toEqual(["use-base"]);
    expect(hook?.typeAliases).toEqual([
      { name: "BaseOptions", description: "", rows: [{ name: "delay", type: "number", defaultValue: null, description: "How long." }] },
    ]);
  });

  it("records a @deprecated re-export as an alias, not as a hook", () => {
    const { catalog } = build({
      hooks: { "use-new": completeHook("useNew") },
      folderIndex: {
        "use-new": 'export * from "./use-new";\n/** @deprecated Use `useNew` instead. */\nexport { useNew as useOld } from "./use-new";\n',
      },
    });
    expect(catalog.hooks.map((h) => h.name)).toEqual(["useNew"]);
    expect(catalog.hooks[0].aliases).toEqual([{ name: "useOld", slug: "use-old", deprecated: "Use `useNew` instead." }]);
  });

  it("reads a `const useX: typeof fn` hook's signature and rows from the annotated type", () => {
    const source = `function base(effect: () => void, deps?: unknown[]): void {}

/**
 * Runs an effect.
 *
 * @category state
 * @keywords a
 * @param effect - The effect.
 * @param deps - The deps.
 *
 * @example Usage
 * ${FENCE}tsx
 * useThing(() => {});
 * ${FENCE}
 */
export const useThing: typeof base = typeof window !== "undefined" ? base : base;
`;
    const { catalog, problems } = build({ hooks: { "use-thing": source } });
    expect(problems).toEqual([]);
    expect(catalog.hooks[0].signature).toBe("useThing(effect: () => void, deps?: unknown[]): void");
    expect(catalog.hooks[0].parameters.map((p) => [p.name, p.type, p.description])).toEqual([
      ["effect", "() => void", "The effect."],
      ["deps", "unknown[]", "The deps."],
    ]);
  });

  it("splits later @example tags into title, description and code", () => {
    const source = completeHook("useThing").replace(
      " */\nexport const",
      [" * @example With a factory", " * Pass a function to compute it once.", ` * ${FENCE}tsx`, " * useThing(2);", ` * ${FENCE}`, " */\nexport const"].join("\n"),
    );
    const hook = hookOf({ hooks: { "use-thing": source } }, "useThing");
    expect(hook?.examples).toEqual([{ title: "With a factory", description: "Pass a function to compute it once.", code: "useThing(2);" }]);
  });

  it("names a destructured parameter after the @param in its position", () => {
    const source = completeHook("useThing", {
      tags: ["@category state", "@keywords a", "@param options - The options.", "@returns value - The value."],
      params: "{ initial }: { initial: number }",
    });
    const { catalog, problems } = build({ hooks: { "use-thing": source } });
    expect(problems).toEqual([]);
    expect(catalog.hooks[0].parameters).toEqual([{ name: "options", type: "{ initial: number }", defaultValue: null, description: "The options." }]);
  });
});

describe("build-catalog --strict: each mistake fails, naming the hook and the field", () => {
  const strict = (fixture: Fixture) => {
    const root = makeFixture(fixture);
    const result = run("build-catalog.mjs", "--strict", "--root", root);
    expect(result.status).toBe(1);
    expect(fs.existsSync(path.join(root, "generated", "catalog.json"))).toBe(false);
    return result.output;
  };
  const thing = (overrides: Parameters<typeof completeHook>[1]) => ({ hooks: { "use-thing": completeHook("useThing", overrides) } });

  it("X1: a hook folder not exported from the barrel", () => {
    const output = strict({ hooks: { "use-thing": completeHook("useThing"), "use-other": completeHook("useOther") }, barrel: ["use-thing"] });
    expect(output).toContain("use-other: barrel: no hook is exported from src/index.ts");
  });

  it("X2: no summary", () => {
    const source = completeHook("useThing").replace(" * Keeps a number for useThing.\n *\n * Longer details about it.\n *\n", "");
    expect(strict({ hooks: { "use-thing": source } })).toContain("use-thing: summary: missing");
  });

  it("X3: a missing category", () => {
    expect(strict(thing({ tags: ["@keywords a", "@param initial - x", "@returns value - y"] }))).toContain("use-thing: category: missing @category");
  });

  it("X3: an unknown category", () => {
    const output = strict(thing({ tags: ["@category nope", "@keywords a", "@param initial - x", "@returns value - y"] }));
    expect(output).toContain('use-thing: category: "nope" is not in catalog/categories.json');
  });

  it("X4: no keywords", () => {
    expect(strict(thing({ tags: ["@category state", "@param initial - x", "@returns value - y"] }))).toContain("use-thing: keywords: missing @keywords");
  });

  it("X5: no usage example", () => {
    const source = completeHook("useThing").replace(/ \* @example[\s\S]*?(?= \*\/)/, "");
    expect(strict({ hooks: { "use-thing": source } })).toContain("use-thing: usage: missing");
  });

  it("X6: @param names a parameter that doesn't exist", () => {
    const output = strict(thing({ tags: ["@category state", "@keywords a", "@param initial - x", "@param bogus - z", "@returns value - y"] }));
    expect(output).toContain('use-thing: parameters: @param "bogus" names no parameter');
  });

  it("X12: a hook that imports a sibling which is no longer an exported hook", () => {
    const body = "const [value] = useState(useGone(initial));\n  return value;";
    const source = completeHook("useThing", { body }).replace('import { useState } from "react";', 'import { useState } from "react";\nimport { useGone } from "../use-gone";');
    expect(strict({ hooks: { "use-thing": source } })).toContain("use-thing: deps: imports ../use-gone, which is not an exported hook");
  });

  it("a TODO placeholder left from the new:hook starter", () => {
    const output = strict(thing({ tags: ["@category state", "@keywords TODO", "@param initial - TODO: say what it does", "@returns value - y"] }));
    expect(output).toContain("use-thing: keywords: replace the TODO placeholder from the new:hook starter");
    expect(output).toContain("use-thing: parameters: replace the TODO placeholder from the new:hook starter");
  });

  it("X11: removed-hooks.json lists a hook that still exists", () => {
    const output = strict({ ...thing({}), removed: [{ slug: "use-thing", name: "useThing", removedIn: null, replacement: null, note: "" }] });
    expect(output).toContain("use-thing: removed: listed in catalog/removed-hooks.json but the hook is still exported");
  });

  it("X13: a category with no hooks", () => {
    const output = strict({ ...thing({}), categories: [{ id: "state", label: "State" }, { id: "data", label: "Data" }] });
    expect(output).toContain("catalog/categories.json: data: no hook has this category");
  });

  it("without --strict, lists the problems, writes the catalog and exits 0", () => {
    const root = makeFixture(thing({ tags: ["@param initial - x"] }));
    const result = run("build-catalog.mjs", "--root", root);
    expect(result.status).toBe(0);
    expect(result.output).toContain("use-thing: category: missing @category");
    expect(result.output).toContain("use-thing: keywords: missing @keywords");
    expect(JSON.parse(fs.readFileSync(path.join(root, "generated", "catalog.json"), "utf8")).hooks).toHaveLength(1);
  });

  it("a clean fixture passes --strict", () => {
    const root = makeFixture(thing({}));
    expect(run("build-catalog.mjs", "--strict", "--root", root).status).toBe(0);
  });
});

describe("build-catalog --manifest and --readme", () => {
  const README = "# hookli\n\n![1 hooks](https://img.shields.io/badge/1_hooks-blue)\n\n<!-- HOOKS:START (generated) -->\nold\n<!-- HOOKS:END -->\n\nAfter.\n";

  it("the manifest is the public projection: summary as description, nothing else", () => {
    const { catalog } = build({ hooks: { "use-thing": completeHook("useThing") } });
    expect(manifestOf(catalog)).toEqual({
      $schema: "hookli hooks manifest",
      hooks: [
        {
          slug: "use-thing",
          name: "useThing",
          description: "Keeps a number for useThing.",
          category: "state",
          signature: "useThing(initial: number): number",
          keywords: ["useThing", "thing"],
        },
      ],
    });
  });

  it("the README index is grouped by category, in categories.json order, with the count", () => {
    const { catalog } = build({
      hooks: { "use-thing": completeHook("useThing"), "use-other": completeHook("useOther", { tags: ["@category data", "@keywords b"] }) },
      categories: [{ id: "data", label: "Data" }, { id: "state", label: "State" }],
    });
    expect(readmeOf(catalog, README)).toBe(
      "# hookli\n\n![1 hooks](https://img.shields.io/badge/2_hooks-blue)\n\n<!-- HOOKS:START (generated) -->\n\n" +
        "### Data (1)\n\n- **[`useOther`](https://hookli.vercel.app/docs/use-other)** — Keeps a number for useOther.\n\n" +
        "### State (1)\n\n- **[`useThing`](https://hookli.vercel.app/docs/use-thing)** — Keeps a number for useThing.\n\n" +
        "<!-- HOOKS:END -->\n\nAfter.\n",
    );
  });

  it("fails when the README has no HOOKS markers", () => {
    const { catalog } = build({ hooks: { "use-thing": completeHook("useThing") } });
    expect(() => readmeOf(catalog, "# hookli\n")).toThrow("HOOKS:START / HOOKS:END");
  });

  it("writes hooks.manifest.json and the README only when asked", () => {
    const root = makeFixture({ hooks: { "use-thing": completeHook("useThing") } });
    fs.writeFileSync(path.join(root, "README.md"), README);
    expect(run("build-catalog.mjs", "--strict", "--root", root).status).toBe(0);
    expect(fs.existsSync(path.join(root, "hooks.manifest.json"))).toBe(false);
    expect(fs.readFileSync(path.join(root, "README.md"), "utf8")).toBe(README);
    expect(run("build-catalog.mjs", "--strict", "--manifest", "--readme", "--root", root).status).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(root, "hooks.manifest.json"), "utf8")).hooks[0].name).toBe("useThing");
    expect(fs.readFileSync(path.join(root, "README.md"), "utf8")).toContain("useThing`](https://hookli.vercel.app/docs/use-thing)");
  });
});

describe("examples:check (X8)", () => {
  const withCatalog = (source: string) => {
    const root = makeFixture({ hooks: { "use-thing": source } });
    expect(run("build-catalog.mjs", "--root", root).status).toBe(0);
    return root;
  };

  it("passes when every example compiles against the library", () => {
    expect(checkExamples(withCatalog(completeHook("useThing")))).toEqual({ count: 1, problems: [] });
  });

  it("passes trivially with no examples", () => {
    const source = completeHook("useThing").replace(/ \* @example[\s\S]*?(?= \*\/)/, "");
    expect(checkExamples(withCatalog(source))).toEqual({ count: 0, problems: [] });
  });

  it("fails on an example that doesn't compile, naming the hook and the field", () => {
    const root = withCatalog(completeHook("useThing").replace("{useThing(1)}", '{useThing("one")}'));
    const { problems } = checkExamples(root);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^use-thing: usage: line 2: Argument of type 'string' is not assignable/);
    const cli = run("check-examples.mjs", "--root", root);
    expect(cli.status).toBe(1);
    expect(cli.output).toContain("use-thing: usage: line 2:");
  });
});

describe("build-catalog over the real src", () => {
  const { catalog } = buildCatalog(PKG);
  const hook = (name: string) => catalog.hooks.find((h) => h.name === name);
  const read = (rel: string) => fs.readFileSync(path.join(PKG, rel), "utf8");

  it("extracts all 66 hooks, each in its own folder", () => {
    expect(catalog.hooks).toHaveLength(66);
    expect(new Set(catalog.hooks.map((h) => h.slug)).size).toBe(66);
    for (const h of catalog.hooks) expect(h.sourcePath).toBe(`packages/hookli/src/hooks/${h.slug}/${h.slug}.ts`);
    expect(catalog.libraryVersion).toBe(JSON.parse(read("package.json")).version);
  });

  it("useHover", () => {
    expect(hook("useHover")).toMatchObject({
      slug: "use-hover",
      signature: "useHover<T extends HTMLElement = HTMLElement>(elementRef: RefObject<T | null> | T | null): boolean",
      parameters: [{ name: "elementRef", type: "RefObject<T | null> | T | null", defaultValue: null }],
      deps: ["use-event-listener"],
    });
    expect(hook("useHover")?.source).toBe(read("src/hooks/use-hover/use-hover.ts"));
  });

  it("useEventListener: four overloads, implementation excluded", () => {
    const h = hook("useEventListener");
    const lines = h?.signature.split("\n") ?? [];
    expect(lines).toHaveLength(4);
    expect(lines[1]).toBe(
      "useEventListener<K extends keyof WindowEventMap>(eventName: K, handler: (event: WindowEventMap[K]) => void, element?: undefined, options?: boolean | AddEventListenerOptions): void",
    );
    expect(lines[3]).toBe(
      "useEventListener<K extends keyof HTMLElementEventMap & keyof SVGElementEventMap, T extends HTMLElement | SVGElement = HTMLDivElement>(eventName: K, handler: (event: HTMLElementEventMap[K] | SVGElementEventMap[K]) => void, element: RefObject<T | null> | T | null, options?: boolean | AddEventListenerOptions): void",
    );
    expect(h?.signature).not.toContain("KW");
    expect(h?.summary).toMatch(/^Subscribes to an event on a media query/);
    expect(h?.parameters.map((p) => p.name)).toEqual(["eventName", "handler", "element", "options"]);
    expect(h?.typeAliases).toEqual([]);
    expect(h?.deps).toEqual(["use-isomorphic-layout-effect"]);
    expect(h?.sourcePath).toBe("packages/hookli/src/hooks/use-event-listener/use-event-listener.ts");
  });

  it("useToggle", () => {
    expect(hook("useToggle")).toMatchObject({
      slug: "use-toggle",
      parameters: [{ name: "initialValue", type: "boolean", defaultValue: "false" }],
      deps: [],
    });
    expect(hook("useToggle")?.source).toBe(read("src/hooks/use-toggle/use-toggle.ts"));
  });

  it("useDebounceCallback", () => {
    const h = hook("useDebounceCallback");
    expect(h?.signature).toBe(
      "useDebounceCallback<Args extends unknown[], R>(fn: (...args: Args) => R, delayMs: number = 500, options: DebounceOptions = {}): DebouncedState<Args, R>",
    );
    expect(h?.deps).toEqual(["use-event-callback", "use-unmount"]);
    expect(h?.typeAliases.map((a) => a.name)).toEqual(["DebounceOptions", "DebouncedState<Args, R>"]);
    expect(h?.typeAliases[0].rows[0]).toMatchObject({ name: "leading", type: "boolean", defaultValue: "false" });
    expect(h?.typeAliases[1].rows.map((r) => r.name)).toEqual(["(...args)", "cancel", "flush", "isPending"]);
  });

  it("useDefault is an alias of useDefaultValue, not a hook of its own", () => {
    expect(hook("useDefault")).toBeUndefined();
    expect(hook("useDefaultValue")?.aliases).toEqual([{ name: "useDefault", slug: "use-default", deprecated: "Use `useDefaultValue` instead." }]);
  });
});
