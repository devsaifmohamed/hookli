// @vitest-environment node
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as hookli from "./index";

/*
 * SSR safety net: server-render every exported hook in plain Node — no window,
 * document or storage, and on Node 21+ only a partial `navigator` — the way
 * Next.js / Remix render on the server. A hook that touches a browser API
 * during render without a guard throws here. Effects do not run in
 * renderToString, so this covers render-phase code only.
 *
 * Every export must be listed below (with arguments, or in NO_ARGS), so a new
 * hook cannot ship without this check.
 */
const noop = () => {};
const asyncNoop = async () => {};
const ref = () => ({ current: null });

const ARGS: Record<string, () => unknown[]> = {
  useForm: () => [{ name: "" }],
  useLocalStorage: () => ["key", 1],
  useLocalStorageWithExpiry: () => ["key", 1, 1000],
  useSessionStorage: () => ["key", 1],
  useReadLocalStorage: () => ["key"],
  useStep: () => [3],
  useCountdown: () => [{ countStart: 10 }],
  useDebounce: () => [1, 100],
  useDebounceValue: () => [1, 100],
  useDebounceCallback: () => [noop, 100],
  useInterval: () => [noop, 100],
  useTimeout: () => [noop, 100],
  useIsomorphicLayoutEffect: () => [noop, []],
  useEventCallback: () => [noop],
  useUnmount: () => [noop],
  useDocumentTitle: () => ["Title"],
  useEventListener: () => ["click", noop],
  useClickOutside: () => [ref(), noop],
  useMousePosition: () => [ref()],
  useInfiniteScroll: () => [asyncNoop],
  useExpandableText: () => ["Some long text"],
  useHover: () => [ref()],
  useResizeObserver: () => [ref()],
  useClickAnyWhere: () => [noop],
  useMediaQuery: () => ["(min-width: 768px)"],
  useScript: () => [null],
  useFetch: () => ["http://127.0.0.1:9/never-called-on-server"],
  usePrevious: () => [1],
  useThrottle: () => [1, 100],
  useUpdateEffect: () => [noop, []],
  useEffectOnce: () => [noop],
  useKeyPress: () => ["Escape"],
  useAsync: () => [asyncNoop, false],
  useMutation: () => [asyncNoop],
  useDefaultValue: () => [null, 1],
  useRafState: () => [1],
  useDeepCompareEffect: () => [noop, [{ a: 1 }]],
  useLongPress: () => [noop],
  useHotkeys: () => ["ctrl+k", noop],
  useFullscreen: () => [ref()],
  usePermission: () => ["geolocation"],
};

const NO_ARGS = new Set([
  "useToggle", "useDarkMode", "useTernaryDarkMode", "useBoolean", "useCounter", "useMap",
  "useIsClient", "useIsMounted", "useIntersectionObserver", "useScrollLock", "useScreen",
  "useWindowSize", "useCopyToClipboard", "useGeoLocation", "useList", "useSet",
  "useWindowScroll", "usePagination", "useNetworkState", "usePageVisibility", "useIdle",
  "useQueue", "useTextSelection", "useDraggable", "useBattery",
  "useDefault", // deprecated alias of useDefaultValue
]);

const exported = Object.entries(hookli).filter(
  ([name, value]) => /^use[A-Z]/.test(name) && typeof value === "function",
) as Array<[string, (...args: unknown[]) => unknown]>;

describe("SSR: every hook server-renders without browser globals", () => {
  it("runs in a real server environment", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("useNetworkState reports online on the server, even where Node defines navigator", () => {
    let result: unknown;
    function Probe() {
      result = hookli.useNetworkState();
      return null;
    }
    renderToString(createElement(Probe));
    expect(result).toEqual({ online: true });
  });

  it("covers every exported hook", () => {
    const unlisted = exported.map(([n]) => n).filter((n) => !(n in ARGS) && !NO_ARGS.has(n));
    expect(unlisted, "add new hooks to ARGS or NO_ARGS in ssr.test.ts").toEqual([]);
  });

  it.each(exported)("%s", (name, hook) => {
    const args = name === "useDefault" ? ARGS.useDefaultValue() : (ARGS[name]?.() ?? []);
    function Probe() {
      hook(...args);
      return null;
    }
    expect(() => renderToString(createElement(Probe))).not.toThrow();
  });
});
