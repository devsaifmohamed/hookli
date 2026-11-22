import { expect } from "vitest";
import { vi } from "vitest";
import type * as Hookli from "../index";

/*
 * Test helper, not exported from the library. Server-renders one hook with the browser
 * globals hidden, the way Next.js / Remix render on the server, so a hook that touches a
 * browser API during render without a guard throws. The library is imported fresh while
 * the globals are hidden, so module-scope checks (`const IS_SERVER = typeof window …`)
 * see the server too. Effects do not run in renderToString: this covers render only.
 */
const BROWSER_GLOBALS = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "screen",
  "localStorage",
  "sessionStorage",
  "matchMedia",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
] as const;

type HookName = { [K in keyof typeof Hookli]: (typeof Hookli)[K] extends (...args: never[]) => unknown ? K : never }[keyof typeof Hookli];

export async function expectSSRSafe<K extends HookName>(name: K, ...args: Parameters<(typeof Hookli)[K]>): Promise<void> {
  const saved = BROWSER_GLOBALS.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  for (const key of BROWSER_GLOBALS) Object.defineProperty(globalThis, key, { value: undefined, configurable: true, writable: true });
  vi.resetModules();
  try {
    const [{ createElement }, { renderToString }, hookli] = await Promise.all([import("react"), import("react-dom/server"), import("../index")]);
    const hook = hookli[name] as (...hookArgs: unknown[]) => unknown;
    function Probe() {
      hook(...args);
      return null;
    }
    expect(typeof window).toBe("undefined");
    expect(() => renderToString(createElement(Probe))).not.toThrow();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
    vi.resetModules();
  }
}
