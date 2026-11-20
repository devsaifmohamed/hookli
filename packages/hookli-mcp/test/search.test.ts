import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/catalog.js";
import { rankHooks, stem, suggestForTask } from "../src/search.js";
import { scoreCases } from "./eval-report.js";
import { HOLDOUT_CASES, TUNING_CASES } from "./search-cases.js";

/* Floors sit a little under today's scores (tuning 100% / holdout 100% top-3)
   so wording tweaks don't flake, while a real regression fails CI. */
describe("search_hooks accuracy on plain-language requests", () => {
  it("tuning set: right hook in top 3 for >= 95% and first for >= 90%", () => {
    const r = scoreCases(TUNING_CASES);
    expect(r.top3 / r.total, r.misses.join("\n")).toBeGreaterThanOrEqual(0.95);
    expect(r.top1 / r.total).toBeGreaterThanOrEqual(0.9);
  });

  it("holdout set (never used for tuning): top 3 >= 90%, first >= 85%", () => {
    const r = scoreCases(HOLDOUT_CASES);
    expect(r.top3 / r.total, r.misses.join("\n")).toBeGreaterThanOrEqual(0.9);
    expect(r.top1 / r.total).toBeGreaterThanOrEqual(0.85);
  });

  it("every hook in the catalog is covered by at least one tuning case", () => {
    const covered = new Set(TUNING_CASES.flatMap((c) => c.expect));
    const missing = CATALOG.map((h) => h.name).filter((n) => !covered.has(n));
    expect(missing).toEqual([]);
  });

  it("exact names and slugs still win", () => {
    expect(rankHooks(CATALOG, "useDebounce")[0].hook.name).toBe("useDebounce");
    expect(rankHooks(CATALOG, "use-local-storage")[0].hook.name).toBe("useLocalStorage");
  });

  it("filler-only and empty queries return nothing", () => {
    expect(rankHooks(CATALOG, "")).toEqual([]);
    expect(rankHooks(CATALOG, "the and when with")).toEqual([]);
  });

  it("respects category and limit", () => {
    const res = rankHooks(CATALOG, "scroll", { category: "dom", limit: 2 });
    expect(res).toHaveLength(2);
    expect(res.every((r) => r.hook.category === "dom")).toBe(true);
  });

  it("words that are Object.prototype keys do not crash the search", () => {
    for (const q of ["constructor", "toString hook", "__proto__ valueOf", "hasOwnProperty"]) {
      expect(() => rankHooks(CATALOG, q)).not.toThrow();
    }
  });

  it("'persistence' finds the storage hooks", () => {
    const names = rankHooks(CATALOG, "persistence", { limit: 3 }).map((r) => r.hook.name);
    expect(names).toContain("useLocalStorage");
  });

  it("useDarkMode is not offered for the OS color-scheme preference (it only reads localStorage)", () => {
    const top = rankHooks(CATALOG, "prefers-color-scheme", { limit: 1 })[0];
    expect(top.hook.name).toBe("useTernaryDarkMode");
  });

  it("camelCase words typed in a query match (API and hook names)", () => {
    const top = (q: string) => rankHooks(CATALOG, q, { limit: 1 })[0]?.hook.name;
    expect(top("save it in localStorage")).toBe("useLocalStorage");
    expect(top("sessionStorage value")).toBe("useSessionStorage");
    expect(top("wrap IntersectionObserver")).toBe("useIntersectionObserver");
    expect(top("Replace react-use useDebounce in this component with hookli")).toBe("useDebounce");
  });

  it("keyboard combos, plurals and nouns ending in -ing still match", () => {
    const top = (q: string) => rankHooks(CATALOG, q, { limit: 1 })[0]?.hook.name;
    expect(top("Ctrl+K opens search")).toBe("useHotkeys");
    expect(top("user setting")).toBe("useLocalStorage");
    expect(top("user settings")).toBe("useLocalStorage");
    expect(top("screens")).toBe("useScreen");
    expect(stem("settings")).toBe(stem("setting"));
  });

  it("an opening task verb does not decide the result", () => {
    const names = rankHooks(CATALOG, "Create a search bar with a debounce", { limit: 3 }).map((r) => r.hook.name);
    expect(names).not.toContain("useMutation");
    expect(names[0]).toMatch(/^useDebounce/);
    const colon = suggestForTask(CATALOG, "Create: a dropdown menu that closes on outside click").map((x) => x.hook.name);
    expect(colon).not.toContain("useMutation");
  });

  it("stems word variants onto one form", () => {
    expect(stem("typing")).toBe(stem("type"));
    expect(stem("stopped")).toBe("stop");
    expect(stem("scrolling")).toBe("scroll");
    expect(stem("press")).toBe("press");
  });
});

describe("suggest_hooks_for_task composes one hook per requirement", () => {
  const cases: Array<[string, string[]]> = [
    ["A modal dialog that closes on ESC key, closes when clicking outside, and locks body scroll", ["useKeyPress", "useClickOutside", "useScrollLock"]],
    ["search page that waits until the user stops typing, shows results with infinite scroll and remembers the last query", ["useDebounce", "useInfiniteScroll", "useLocalStorage"]],
    ["dashboard that polls every 10 seconds, pauses when the tab is hidden and shows an offline banner", ["useInterval", "usePageVisibility", "useNetworkState"]],
    ["image gallery with lazy loading, fullscreen view and keyboard shortcuts", ["useIntersectionObserver", "useFullscreen", "useHotkeys"]],
    ["draggable chat widget that remembers its position and hides on mobile", ["useDraggable", "useLocalStorage", "useMediaQuery"]],
    // The examples shown on hookli.vercel.app/docs/mcp:
    ["I need to close a dropdown whenever the user clicks outside or presses Escape.", ["useClickOutside", "useKeyPress"]],
    ["Create a search bar with 300ms debounce that stores the last query in localStorage.", ["useDebounce", "useLocalStorage"]],
    ["Build a slide-over drawer and prevent background body scrolling when it opens.", ["useScrollLock"]],
  ];
  it("keeps every requirement's primary hook when the list is truncated", () => {
    const task = "draggable widget that remembers its position, closes on outside click, locks body scroll";
    const all = suggestForTask(CATALOG, task, 10).map((s) => s.hook.name);
    const capped = suggestForTask(CATALOG, task, 3).map((s) => s.hook.name);
    expect(all.length).toBeGreaterThan(3);
    expect(capped).toEqual(expect.arrayContaining(["useClickOutside", "useScrollLock"]));
    expect(capped).toHaveLength(3);
  });

  it("a dot inside an identifier does not split a requirement", () => {
    const res = suggestForTask(CATALOG, "read window.screen size");
    expect(res.map((x) => x.hook.name)[0]).toBe("useScreen");
    expect(new Set(res.map((x) => x.covers)).size).toBe(1);
  });

  it("a generic word does not pull in an unrelated second hook", () => {
    const names = suggestForTask(CATALOG, "modal that closes on ESC").map((x) => x.hook.name);
    expect(names).toContain("useKeyPress");
    expect(names).not.toContain("useSessionStorage");
  });

  it.each(cases)("%s", (task, expected) => {
    const names = suggestForTask(CATALOG, task).map((s) => s.hook.name);
    for (const hook of expected) expect(names).toContain(hook);
    expect(names.length).toBeLessThanOrEqual(expected.length + 1);
  });
});
