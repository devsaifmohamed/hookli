import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG, CATALOG_META, CATEGORY_IDS, getHookBySlugOrName, getRemovedHook, removedAnswer, type RemovedHook } from "../src/catalog.js";
import type { HookCategory } from "../src/types.js";

const read = (rel: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, rel), "utf8"));
const library = read("../../hookli/generated/catalog.json");

describe("the bundled catalog is the library's", () => {
  it("has the library's hooks, in order, with the summary as description", () => {
    expect(CATALOG.map((h) => h.name)).toEqual(library.hooks.map((h: { name: string }) => h.name));
    expect(CATALOG.map((h) => h.description)).toEqual(library.hooks.map((h: { summary: string }) => h.summary));
  });

  it("reports the library version it was built from and the server's own version", () => {
    expect(CATALOG_META).toEqual({
      libraryVersion: read("../../hookli/package.json").version,
      mcpVersion: read("../package.json").version,
      hookCount: library.hooks.length,
    });
  });

  it("the HookCategory type lists exactly the library's categories", () => {
    expect(CATEGORY_IDS).toEqual(["state", "effects", "dom", "data"] satisfies HookCategory[]);
  });

  it("every hook links to its docs page", () => {
    for (const h of CATALOG) expect(h.docsUrl).toBe(`https://hookli.vercel.app/docs/${h.slug}`);
  });
});

describe("lookups", () => {
  it("finds a hook by name or slug", () => {
    expect(getHookBySlugOrName("useDebounce")?.slug).toBe("use-debounce");
    expect(getHookBySlugOrName("use-debounce")?.name).toBe("useDebounce");
    expect(getHookBySlugOrName("use-click-any-where")?.name).toBe("useClickAnyWhere");
  });

  it("a deprecated alias finds the hook it points to", () => {
    expect(getHookBySlugOrName("useDefault")?.name).toBe("useDefaultValue");
    expect(getHookBySlugOrName("use-default")?.name).toBe("useDefaultValue");
  });

  it("answers for a removed hook: when, and what to use instead", () => {
    const removed: RemovedHook[] = [
      { slug: "use-old", name: "useOld", removedIn: "2.0.0", replacement: "use-debounce", note: "Merged into useDebounce." },
      { slug: "use-gone", name: "useGone", removedIn: null, replacement: null, note: "" },
    ];
    const old = getRemovedHook("use-old", removed);
    expect(old?.name).toBe("useOld");
    expect(removedAnswer(old!)).toBe("`useOld` was removed from hookli in v2.0.0. Use `useDebounce` instead. Merged into useDebounce.");
    expect(removedAnswer(getRemovedHook("useGone", removed)!)).toBe("`useGone` was removed from hookli in the next release.");
    expect(getRemovedHook("useDebounce", removed)).toBeUndefined();
  });
});
