// "Before" replay for the cleanliness score (RFC docs/plans/2026-11-21-single-source.md, §5).
// Release branch only: it measures TODAY's layout and is deleted before merge.
//
//   node scripts/cleanliness/before-replay.mjs [--jobs 3] [--only S1,X4] [--skip-playgrounds]
//
// For each scenario (M2) and mistake (M3) it makes a throwaway git worktree of HEAD in the OS temp
// dir, applies the edits a contributor makes today, runs the generators (as the contributor must),
// commits, then runs CI's command set. Scenarios must end green with their end state true; the edit
// count is the files in that commit. A mistake is caught when any CI command fails.
// A full run writes scripts/cleanliness/before-results.json; --only / --skip-playgrounds just print.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(repo, "scripts/cleanliness/before-results.json");
const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const jobs = Number(flag("--jobs") ?? 3);
const only = flag("--only")?.split(",");
const skipPlaygrounds = argv.includes("--skip-playgrounds");
const env = { ...process.env, CI: "1", FORCE_COLOR: "0", TURBO_UI: "false", TURBO_TELEMETRY_DISABLED: "1", NEXT_TELEMETRY_DISABLED: "1" };

// The steps of .github/workflows/ci.yml, in order (job "build", then job "playgrounds").
// Not run: the react-18 job. It re-runs the library typecheck and tests on React 18 after a network
// `pnpm add`; none of the edits below depend on the React version.
const GENERATORS = "node scripts/build-mcp-catalog.mjs && node scripts/gen-hook-sources.mjs && pnpm --filter hookli run gen:manifest";
const CI_STEPS = [
  ["generated files", "bash", ["-c", `${GENERATORS} && test -z "$(git status --porcelain)"`]],
  ["build", "pnpm", ["build"]],
  ["test", "pnpm", ["test"]],
  ["test:package", "pnpm", ["--filter", "hookli-mcp", "run", "test:package"]],
  ["lint", "pnpm", ["lint"]],
  ["typecheck", "pnpm", ["typecheck"]],
  ["playgrounds", "pnpm", ["--filter", "hookli-docs", "run", "check:playgrounds"]],
].filter(([name]) => !(skipPlaygrounds && name === "playgrounds"));

const sh = (cmd, args, cwd) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => resolve({ code, out }));
  });
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

// A throwaway copy of the repo with small, loud edit helpers: an edit that no longer matches fails.
class Copy {
  constructor(dir) {
    this.dir = dir;
    this.renames = 0;
  }
  p = (rel) => path.join(this.dir, rel);
  read = (rel) => fs.readFileSync(this.p(rel), "utf8");
  exists = (rel) => fs.existsSync(this.p(rel));
  write(rel, text) {
    fs.mkdirSync(path.dirname(this.p(rel)), { recursive: true });
    fs.writeFileSync(this.p(rel), text);
  }
  edit(rel, from, to) {
    const text = this.read(rel);
    const hits = typeof from === "string" ? text.split(from).length - 1 : (text.match(new RegExp(from, "g")) ?? []).length;
    if (hits !== 1) throw new Error(`${rel}: expected 1 match of ${from}, found ${hits}`);
    this.write(rel, text.replace(from, to));
  }
  replaceAll(rel, from, to) {
    if (!this.read(rel).includes(from)) throw new Error(`${rel}: no ${from}`);
    this.write(rel, this.read(rel).replaceAll(from, to));
  }
  rm = (rel) => fs.rmSync(this.p(rel));
  mv(from, to) {
    fs.mkdirSync(path.dirname(this.p(to)), { recursive: true });
    fs.renameSync(this.p(from), this.p(to));
    this.renames += 1; // one file moved, counted once
  }
  manifest(fn) {
    const rel = "packages/hookli/hooks.manifest.json";
    const data = JSON.parse(this.read(rel));
    fn(data.hooks);
    this.write(rel, JSON.stringify(data, null, 2) + "\n");
  }
  hook = (slug, fn) => this.manifest((hooks) => fn(hooks.find((h) => h.slug === slug)));
  mcp(expr) {
    const code = `import * as m from "./packages/hookli-mcp/dist/index.mjs"; console.log(JSON.stringify(${expr}));`;
    return JSON.parse(execFileSync("node", ["--input-type=module", "-e", code], { cwd: this.dir, encoding: "utf8" }));
  }
  next = (rel) => (this.exists(`apps/docs/.next/server/app/${rel}`) ? this.read(`apps/docs/.next/server/app/${rel}`) : "");
  redirects = () => JSON.parse(this.read("apps/docs/.next/routes-manifest.json")).redirects.map((r) => `${r.source} -> ${r.destination}`);
}

// ---- Edits shared by recipes and mistakes (today's layout) ----
const DOCS = "apps/docs/lib/hook-docs.ts";
const BARREL = "packages/hookli/src/hooks/index.ts";
const MCP_README = "packages/hookli-mcp/README.md";
const pascal = (name) => name[0].toUpperCase() + name.slice(1);
const docEntry = (c, slug) => {
  const text = c.read(DOCS);
  const start = text.indexOf(`\n  "${slug}": {\n`);
  if (start < 0) throw new Error(`no ${slug} entry in ${DOCS}`);
  return text.slice(start, text.indexOf("\n  },\n", start) + "\n  },".length);
};
const setHookCount = (c, from, to) => c.write(MCP_README, c.read(MCP_README).replace(new RegExp(`\\b${from}\\b(?= (typed|hooks))`, "g"), String(to)));
const addRedirect = (c, from, to) =>
  c.edit("apps/docs/next.config.ts", "  /* config options here */\n", `  async redirects() {\n    return [{ source: "/docs/${from}", destination: "/docs/${to}", permanent: true }];\n  },\n`);
const addDoc = (c, slug, name, entry) => {
  c.edit(DOCS, `import { UseRafStateDocDemo } from "@/components/demos/use-raf-state-demo";\n`, (m) => `${m}import { ${pascal(name)}DocDemo } from "@/components/demos/${slug}-demo";\n`);
  c.edit(DOCS, "\n};\n\nexport function getHookDoc", `\n  "${slug}": {\n    demo: ${pascal(name)}DocDemo,\n${entry}\n  },\n};\n\nexport function getHookDoc`);
};
const removeDoc = (c, slug, name) => {
  c.edit(DOCS, `import { ${pascal(name)}DocDemo } from "@/components/demos/${slug}-demo";\n`, "");
  c.edit(DOCS, docEntry(c, slug), "");
};
// S8 recipe, reused by X12: delete a hook everywhere it is written by hand today.
const deleteHook = (c, slug, name, replacement) => {
  for (const f of ["index.ts", `${slug}.ts`, `${slug}.test.ts`]) c.rm(`packages/hookli/src/hooks/${slug}/${f}`);
  c.edit(BARREL, `export * from "./${slug}";\n`, "");
  c.manifest((hooks) => hooks.splice(hooks.findIndex((h) => h.slug === slug), 1));
  c.rm(`apps/docs/components/demos/${slug}-demo.tsx`);
  removeDoc(c, slug, name);
  addRedirect(c, slug, replacement); // today's stand-in for "Removed in vX, use Y"
  setHookCount(c, 66, 65);
};

const RENDER_COUNT = {
  "packages/hookli/src/hooks/use-render-count/use-render-count.ts": `import { useRef } from "react";

/**
 * Counts how many times the component has rendered, starting at 1.
 *
 * @returns The number of renders so far.
 */
export const useRenderCount = (): number => {
  const count = useRef(0);
  count.current += 1;
  return count.current;
};
`,
  "packages/hookli/src/hooks/use-render-count/use-render-count.test.ts": `import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRenderCount } from "./use-render-count";

describe("useRenderCount", () => {
  it("counts every render", () => {
    const { result, rerender } = renderHook(() => useRenderCount());
    expect(result.current).toBe(1);

    rerender();
    expect(result.current).toBe(2);
  });
});
`,
  "packages/hookli/src/hooks/use-render-count/index.ts": `export * from "./use-render-count";\n`,
  "apps/docs/components/demos/use-render-count-demo.tsx": `"use client";

import { useState } from "react";
import { useRenderCount } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseRenderCountDocDemo() {
  const renders = useRenderCount();
  const [, setTick] = useState(0);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="renders">{renders}</DemoReadout>
      </dl>
      <DemoButton onClick={() => setTick((t) => t + 1)}>Re-render</DemoButton>
    </div>
  );
}
`,
};
const RENDER_COUNT_DOC = `    usage: \`
import { useRenderCount } from "hookli";

export function Demo() {
  const renders = useRenderCount();

  return <p>Rendered {renders} times</p>;
}
\`,
    parameters: [],
    returns: [{ name: "count", type: "number", description: "How many times the component has rendered." }],`;

// ---- Scenarios (M2): the edits a contributor makes today, then the RFC's "must be true after" ----
const SCENARIOS = {
  S1: {
    title: "Add a hook (useRenderCount)",
    apply(c) {
      for (const [rel, text] of Object.entries(RENDER_COUNT)) c.write(rel, text);
      c.write(BARREL, c.read(BARREL).trimEnd() + `\nexport * from "./use-render-count";\n`);
      c.manifest((hooks) =>
        hooks.push({
          slug: "use-render-count", name: "useRenderCount", description: "Counts how many times the component has rendered.",
          category: "state", signature: "useRenderCount(): number", keywords: ["render count", "count renders", "how many renders", "rerender counter"],
        }),
      );
      c.edit("packages/hookli/src/ssr.test.ts", `  "useDefault", // deprecated`, `  "useRenderCount",\n  "useDefault", // deprecated`);
      addDoc(c, "use-render-count", "useRenderCount", RENDER_COUNT_DOC);
      c.edit("packages/hookli-mcp/test/search-cases.ts", `  { query: "avoid setting state after unmount", expect: ["useIsMounted"] },\n`, (m) => `${m}  { query: "count how many times a component re-renders", expect: ["useRenderCount"] },\n`);
      setHookCount(c, 66, 67);
    },
    check: (c) => ({
      "npm types export useRenderCount": c.read("packages/hookli/dist/index.d.ts").includes("useRenderCount"),
      "hookli/manifest lists it": c.read("packages/hookli/hooks.manifest.json").includes('"use-render-count"'),
      "README index + count (package and root)": ["README.md", "packages/hookli/README.md"].every((f) => c.read(f).includes("[`useRenderCount`]") && c.read(f).includes("badge/67_hooks-")),
      "/docs/use-render-count page with its demo": c.next("docs/use-render-count.html").includes("Re-render"),
      "llms.txt lists it": c.next("llms.txt.body").includes("use-render-count"),
      "MCP list_hooks": c.mcp("m.getAllHooks().map((h) => h.name)").includes("useRenderCount"),
      "MCP search_hooks": c.mcp(`m.searchHooks("count renders").slice(0, 3).map((r) => r.hook.name)`).includes("useRenderCount"),
    }),
  },
  S3: {
    title: "Bug fix, no API change (useIsMounted)",
    apply(c) {
      c.edit("packages/hookli/src/hooks/use-is-mounted/use-is-mounted.ts", "() => isMounted.current, []", "() => isMounted.current === true, []");
      c.edit("packages/hookli/src/hooks/use-is-mounted/use-is-mounted.test.ts", /\n\}\);\n$/, `\n\n  it("always returns a boolean", () => {\n    const { result } = renderHook(() => useIsMounted());\n    expect(typeof result.current()).toBe("boolean");\n  });\n});\n`);
    },
    check: (c) => ({
      "docs Source / llms markdown show the new code": c.next("docs/use-is-mounted/llms.txt.body").includes("isMounted.current === true"),
      "StackBlitz source data has the new code": c.read("apps/docs/lib/hook-sources.generated.ts").includes("isMounted.current === true"),
      "MCP get_hook_source": c.mcp(`m.getHookBySlugOrName("useIsMounted").source`).includes("isMounted.current === true"),
    }),
  },
  S4: {
    title: "Public API change: useDocumentTitle(title: string | null)",
    apply(c) {
      const file = "packages/hookli/src/hooks/use-document-title/use-document-title.ts";
      c.edit(file, "  title: string,\n", "  title: string | null,\n");
      c.edit(file, "    window.document.title = title;\n", "    if (title !== null) window.document.title = title;\n");
      c.edit(file, "@param title - The document title to apply.", "@param title - The document title to apply, or `null` to leave it unchanged.");
      c.edit("packages/hookli/src/hooks/use-document-title/use-document-title.test.ts", /\n\}\);\n$/, `\n\n  it("leaves the title alone when title is null", () => {\n    document.title = "Untouched";\n    renderHook(() => useDocumentTitle(null));\n    expect(document.title).toBe("Untouched");\n  });\n});\n`);
      c.hook("use-document-title", (h) => (h.signature = "useDocumentTitle(title: string | null, options?: UseDocumentTitleOptions): void"));
      c.edit(DOCS, `name: "title",\n        type: "string",\n        description: "The document title to apply.`, `name: "title",\n        type: "string | null",\n        description: "The document title to apply, or null to leave it unchanged.`);
    },
    check: (c) => ({
      "npm types": c.read("packages/hookli/dist/index.d.ts").includes("title: string | null"),
      "manifest signature": c.read("packages/hookli/hooks.manifest.json").includes("useDocumentTitle(title: string | null"),
      "docs tables": c.next("docs/use-document-title/llms.txt.body").includes("`title`: `string | null`"),
      "MCP signature + parameters": (() => {
        const h = c.mcp(`m.getHookBySlugOrName("use-document-title")`);
        return h.signature.includes("string | null") && h.parameters[0].type === "string | null";
      })(),
    }),
  },
  S5: {
    title: "Docs text only: useIsMounted summary, example, keywords",
    apply(c) {
      c.hook("use-is-mounted", (h) => {
        h.description = "A stable getter for whether the component is still mounted, for async callbacks.";
        h.keywords.push("zombie component");
      });
      c.edit(DOCS, "// Skip the update if the component unmounted while waiting.", "// Skip the update if the component unmounted mid-request.");
    },
    check: (c) => ({
      "README line": ["README.md", "packages/hookli/README.md"].every((f) => c.read(f).includes("still mounted, for async callbacks.")),
      "docs page summary": c.next("docs/use-is-mounted.html").includes("still mounted, for async callbacks."),
      "docs example": c.next("docs/use-is-mounted/llms.txt.body").includes("unmounted mid-request"),
      "MCP search by the new keyword": c.mcp(`m.searchHooks("zombie component")[0].hook.name`) === "useIsMounted",
      "MCP usage": c.mcp(`m.getHookBySlugOrName("useIsMounted").usage`).includes("unmounted mid-request"),
    }),
  },
  S6: {
    title: "Rename with deprecated alias: usePageVisibility -> useDocumentVisibility",
    apply(c) {
      const [from, to] = ["packages/hookli/src/hooks/use-page-visibility/use-page-visibility", "packages/hookli/src/hooks/use-document-visibility/use-document-visibility"];
      for (const ext of [".ts", ".test.ts"]) {
        c.mv(from + ext, to + ext);
        c.replaceAll(to + ext, "usePageVisibility", "useDocumentVisibility");
      }
      c.replaceAll(to + ".test.ts", "./use-page-visibility", "./use-document-visibility");
      c.mv("packages/hookli/src/hooks/use-page-visibility/index.ts", "packages/hookli/src/hooks/use-document-visibility/index.ts");
      c.write("packages/hookli/src/hooks/use-document-visibility/index.ts", `export * from "./use-document-visibility";\nimport { useDocumentVisibility } from "./use-document-visibility";\n\n/** @deprecated Use \`useDocumentVisibility\` instead. */\nexport const usePageVisibility = useDocumentVisibility;\n`);
      c.edit(BARREL, `export * from "./use-page-visibility";`, `export * from "./use-document-visibility";`);
      c.hook("use-page-visibility", (h) => Object.assign(h, { slug: "use-document-visibility", name: "useDocumentVisibility", signature: "useDocumentVisibility(): boolean" }));
      c.mv("apps/docs/components/demos/use-page-visibility-demo.tsx", "apps/docs/components/demos/use-document-visibility-demo.tsx");
      c.replaceAll("apps/docs/components/demos/use-document-visibility-demo.tsx", "PageVisibility", "DocumentVisibility");
      for (const [a, b] of [["PageVisibility", "DocumentVisibility"], ["use-page-visibility", "use-document-visibility"]]) c.replaceAll(DOCS, a, b);
      addRedirect(c, "use-page-visibility", "use-document-visibility");
      c.edit("packages/hookli/src/ssr.test.ts", `"usePageVisibility",`, `"usePageVisibility", "useDocumentVisibility",`);
      for (const f of ["packages/hookli-mcp/test/search-cases.ts", "packages/hookli-mcp/test/search.test.ts"]) c.replaceAll(f, "usePageVisibility", "useDocumentVisibility");
    },
    check: (c) => ({
      "old name importable and deprecated": /@deprecated Use `useDocumentVisibility`[\s\S]{0,200}usePageVisibility/.test(c.read("packages/hookli/dist/index.d.ts")),
      "no catalog entry for the old name": !c.read("packages/hookli/hooks.manifest.json").includes("usePageVisibility") && c.mcp(`m.getAllHooks().filter((h) => h.name === "usePageVisibility").length`) === 0,
      "new page, no old page": c.next("docs/use-document-visibility.html") !== "" && c.next("docs/use-page-visibility.html") === "",
      "old URL redirects": c.redirects().includes("/docs/use-page-visibility -> /docs/use-document-visibility"),
    }),
  },
  S7: {
    title: "Move to another category: useDocumentTitle effects -> dom",
    apply: (c) => c.hook("use-document-title", (h) => (h.category = "dom")),
    check: (c) => ({
      "README grouping": ["README.md", "packages/hookli/README.md"].every((f) => {
        const md = c.read(f);
        const at = md.indexOf("[`useDocumentTitle`]");
        return at > md.indexOf("### DOM (") && at < md.indexOf("### Data (");
      }),
      "docs category": c.next("docs/use-document-title/llms.txt.body").includes("- Category: DOM"),
      "MCP filter": c.mcp(`m.getHooksByCategory("dom").map((h) => h.name)`).includes("useDocumentTitle"),
    }),
  },
  S8: {
    title: "Delete a hook: useEffectOnce (use useUpdateEffect)",
    unreachable: "The 'Removed in vX, use Y' page and the MCP get_hook removed answer don't exist today; the recipe adds a redirect to the replacement instead.",
    apply: (c) => deleteHook(c, "use-effect-once", "useEffectOnce", "use-update-effect"),
    check: (c) => ({
      "gone from npm": !c.read("packages/hookli/dist/index.d.ts").includes("useEffectOnce"),
      "gone from README + count": ["README.md", "packages/hookli/README.md"].every((f) => !c.read(f).includes("useEffectOnce") && c.read(f).includes("badge/65_hooks-")),
      "gone from docs nav and llms.txt": c.next("docs/use-effect-once.html") === "" && !c.next("llms.txt.body").includes("use-effect-once"),
      "old URL names the replacement (redirect)": c.redirects().includes("/docs/use-effect-once -> /docs/use-update-effect"),
      "gone from MCP": !c.mcp("m.getAllHooks().map((h) => h.name)").includes("useEffectOnce"),
    }),
  },
};

// ---- Mistakes (M3): the RFC's X1–X15, each applied to every place that fact is hand-written today ----
const MISTAKES = {
  X1: { hook: "useHover", how: "barrel line for use-hover removed", apply: (c) => c.edit(BARREL, `export * from "./use-hover";\n`, "") },
  X2: {
    hook: "useIsMounted",
    how: "no summary anywhere: JSDoc removed and manifest description emptied",
    apply(c) {
      c.edit("packages/hookli/src/hooks/use-is-mounted/use-is-mounted.ts", /\/\*\*[\s\S]*?\*\/\n(?=export const useIsMounted)/, "");
      c.hook("use-is-mounted", (h) => (h.description = ""));
    },
  },
  X3: { hook: "useIsMounted", how: "manifest category 'misc'", apply: (c) => c.hook("use-is-mounted", (h) => (h.category = "misc")) },
  X4: { hook: "useIsMounted", how: "manifest keywords []", apply: (c) => c.hook("use-is-mounted", (h) => (h.keywords = [])) },
  X5: { hook: "useIsMounted", how: "hook-docs.ts usage emptied", apply: (c) => c.edit(DOCS, /(\n {2}"use-is-mounted": \{\n {4}demo: UseIsMountedDocDemo,\n {4}usage: `)[\s\S]*?`,/, "$1`,") },
  X6: {
    hook: "useDocumentTitle",
    how: "@param and the docs Parameters row name 'heading', which doesn't exist",
    apply(c) {
      c.edit("packages/hookli/src/hooks/use-document-title/use-document-title.ts", "@param title -", "@param heading -");
      c.edit(DOCS, `name: "title",\n        type: "string",\n        description: "The document title`, `name: "heading",\n        type: "string",\n        description: "The document title`);
    },
  },
  X7: {
    hook: "useDocumentTitle",
    how: "parameter 'options' has no @param and no docs Parameters row",
    apply(c) {
      c.edit("packages/hookli/src/hooks/use-document-title/use-document-title.ts", " * @param options - Behaviour options (see {@link UseDocumentTitleOptions}).\n", "");
      c.edit(DOCS, `      {\n        name: "options",\n        type: "UseDocumentTitleOptions",\n        defaultValue: "{}",\n        description: "Behaviour options (see below).",\n      },\n`, "");
    },
  },
  X8: { hook: "useDocumentTitle", how: "usage example calls useDocumentTitle(42, …)", apply: (c) => c.edit(DOCS, `useDocumentTitle("Dashboard — hookli", {`, "useDocumentTitle(42, {") },
  X9: {
    hook: "useGhost",
    how: "demo + hook-docs entry for use-ghost, which isn't a hook",
    apply(c) {
      c.write("apps/docs/components/demos/use-ghost-demo.tsx", `"use client";\n\nimport { useGhost } from "hookli";\n\nexport function UseGhostDocDemo() {\n  const value = useGhost();\n\n  return <p>{String(value)}</p>;\n}\n`);
      addDoc(c, "use-ghost", "useGhost", `    usage: \`\nimport { useGhost } from "hookli";\n\nexport function Demo() {\n  return <p>{String(useGhost())}</p>;\n}\n\`,\n    parameters: [],\n    returns: [],`);
    },
  },
  X10: {
    hook: "useIsMounted",
    how: "demo file and hook-docs entry removed (the useDraggable miss, 3c1e009)",
    apply(c) {
      c.rm("apps/docs/components/demos/use-is-mounted-demo.tsx");
      removeDoc(c, "use-is-mounted", "useIsMounted");
    },
  },
  X11: {
    hook: "useIsMounted",
    how: "no removed-hooks.json today; its stand-in (the S8 redirect to a replacement) added for a hook that still exists",
    apply: (c) => addRedirect(c, "use-is-mounted", "use-unmount"),
  },
  X12: { hook: "useEventListener", how: "S8 recipe applied to use-event-listener, which 6 hooks import", apply: (c) => deleteHook(c, "use-event-listener", "useEventListener", "use-hover") },
  X13: {
    hook: "media",
    how: "category 'media' added to all 6 category lists (gen-readme.mjs, hooks-registry.ts, docs page.tsx + sidebar.tsx, MCP types.ts + zod enum) with no hooks",
    apply(c) {
      c.edit("packages/hookli/scripts/gen-readme.mjs", `"data"];`, `"data", "media"];`);
      c.edit("packages/hookli/scripts/gen-readme.mjs", `data: "Data" };`, `data: "Data", media: "Media" };`);
      c.edit("apps/docs/lib/hooks-registry.ts", `"dom" | "data";`, `"dom" | "data" | "media";`);
      c.edit("apps/docs/lib/hooks-registry.ts", `  "data",\n] as const;`, `  "data",\n  "media",\n] as const;`);
      c.edit("apps/docs/lib/hooks-registry.ts", `  data: "Data",\n};`, `  data: "Data",\n  media: "Media",\n};`);
      c.edit("apps/docs/app/docs/page.tsx", `  data: {\n    title: "Data & Storage",`, `  media: {\n    title: "Media",\n    desc: "Audio and video.",\n    icon: SlidersIcon,\n    featured: [],\n  },\n  data: {\n    title: "Data & Storage",`);
      c.edit("apps/docs/components/sidebar.tsx", "  data: DatabaseIcon,\n};", "  data: DatabaseIcon,\n  media: SlidersIcon,\n};");
      c.edit("packages/hookli-mcp/src/types.ts", `"dom" | "data";`, `"dom" | "data" | "media";`);
      c.edit("packages/hookli-mcp/src/tools/index.ts", `"dom", "data"]);`, `"dom", "data", "media"]);`);
    },
  },
  X14: { hook: "useDocumentTitle", how: "docs Parameters type for title is 'number', the code says string", apply: (c) => c.edit(DOCS, `name: "title",\n        type: "string",`, `name: "title",\n        type: "number",`) },
  X15: { hook: "useIsMounted", how: "manifest description reworded away from the JSDoc", apply: (c) => c.hook("use-is-mounted", (h) => (h.description = "Tells you whether the component is mounted.")) },
};

// ---- Runner ----
const active = new Set();
const cleanup = (dir) => {
  try { git(repo, "worktree", "remove", "--force", dir); } catch { fs.rmSync(dir, { recursive: true, force: true }); }
  active.delete(dir);
};
process.on("SIGINT", () => {
  for (const dir of active) cleanup(dir);
  git(repo, "worktree", "prune");
  process.exit(130);
});

const mentions = (text, name) => new RegExp(`\\b${name}\\b`).test(text);

async function replay(id, task, isScenario) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `hookli-replay-${id}-`));
  active.add(dir);
  const started = Date.now();
  const c = new Copy(dir);
  try {
    git(repo, "worktree", "add", "--detach", "--quiet", dir, "HEAD");
    const install = await sh("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], dir);
    if (install.code) throw new Error(`pnpm install failed:\n${install.out}`);
    task.apply(c);
    git(dir, "add", "-A");
    const hand = git(dir, "diff", "--cached", "--name-only", "--no-renames").split("\n").filter(Boolean);
    const regen = await sh("bash", ["-c", GENERATORS], dir); // the contributor's own generator run
    if (isScenario && regen.code) throw new Error(`generators failed:\n${regen.out}`);
    git(dir, "add", "-A");
    const all = git(dir, "diff", "--cached", "--name-only", "--no-renames").split("\n").filter(Boolean);
    git(dir, "-c", "user.name=replay", "-c", "user.email=replay@localhost", "commit", "--quiet", "--no-verify", "-m", id);
    const steps = {};
    let failed;
    for (const [name, cmd, args] of CI_STEPS) {
      const { code, out } = await sh(cmd, args, dir);
      steps[name] = code === 0 ? "pass" : "fail";
      if (code) {
        const lines = out.replace(/\x1b\[[0-9;]*m/g, "").replaceAll(fs.realpathSync(dir), "<copy>").replaceAll(dir, "<copy>").trim().split("\n");
        const errors = lines.filter((l) => /FAIL|Error|error|×|✗|Expected|Received|stale/.test(l)).slice(0, 25);
        failed = { step: name, tail: [...new Set([...errors, ...lines.slice(-3)])].join("\n") };
        break; // one failing command decides both outcomes
      }
    }
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`${id}: ${failed ? `fails at ${failed.step}` : "CI green"} (${seconds}s)`);
    if (!isScenario) {
      const slug = task.hook.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const namesHook = Boolean(failed) && [task.hook, slug].some((n) => mentions(failed.tail, n) || (regen.code !== 0 && mentions(regen.out, n)));
      return { how: task.how, caught: Boolean(failed), failedStep: failed?.step ?? null, namesHook, steps, output: failed?.tail ?? null };
    }
    const endState = failed ? {} : task.check(c);
    const green = !failed && Object.values(endState).every(Boolean);
    const generated = all.filter((f) => !hand.includes(f));
    return {
      title: task.title, edits: all.length - c.renames, green, steps, endState,
      handFiles: hand, generatedFiles: generated, renamedFiles: c.renames,
      ...(task.unreachable && { unreachable: task.unreachable }), ...(failed && { output: failed.tail }),
    };
  } finally {
    cleanup(dir);
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

const started = Date.now();
const tasks = [...Object.entries(SCENARIOS).map(([id, t]) => [id, t, true]), ...Object.entries(MISTAKES).map(([id, t]) => [id, t, false])]
  .filter(([id]) => !only || only.includes(id));
const done = await pool(tasks, jobs, ([id, task, isScenario]) => replay(id, task, isScenario).catch((error) => ({ error: String(error.stack ?? error) })));
git(repo, "worktree", "prune");

const results = {
  commit: git(repo, "rev-parse", "HEAD"),
  measuredAt: new Date().toISOString(),
  runtimeSeconds: Math.round((Date.now() - started) / 1000),
  ciSteps: CI_STEPS.map(([name]) => name),
  notRun: "react-18 CI job (same library typecheck + tests on React 18; no edit here depends on the React version)",
  scenarios: {},
  mistakes: {},
};
tasks.forEach(([id, , isScenario], i) => (results[isScenario ? "scenarios" : "mistakes"][id] = done[i]));
const errors = Object.entries({ ...results.scenarios, ...results.mistakes }).filter(([, r]) => r.error || r.green === false);
for (const [id, r] of errors) console.error(`\n${id} did not complete:\n${r.error ?? JSON.stringify(r, null, 2)}`);

if (only || skipPlaygrounds) console.log(JSON.stringify(results, null, 2));
else if (!errors.length) {
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nWrote ${path.relative(repo, outPath)} in ${results.runtimeSeconds}s`);
}
process.exit(errors.length ? 1 : 0);
