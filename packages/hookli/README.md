<p align="center">
  <a href="https://www.npmjs.com/package/hookli">
    <img src="https://raw.githubusercontent.com/saifmohamedsv/hookli/main/assets/hookli-banner.png" alt="hookli — React hooks, ready to use" width="680" />
  </a>
</p>

<h1 align="center">hookli</h1>

<p align="center">
  A tiny, typed collection of the React hooks you reach for every day.<br/>
  <strong>Ready to use · written in TypeScript · zero dependencies.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/v/hookli?style=flat-square&color=0A0D12" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dm/hookli?style=flat-square&color=61DAFB&label=downloads%2Fmonth" alt="npm downloads per month" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dt/hookli?style=flat-square&color=0A0D12&label=total%20downloads" alt="total npm downloads" /></a>
  <a href="https://bundlephobia.com/package/hookli"><img src="https://img.shields.io/bundlephobia/minzip/hookli?style=flat-square&color=61DAFB" alt="minzipped size" /></a>
  <a href="https://github.com/saifmohamedsv/hookli"><img src="https://img.shields.io/github/stars/saifmohamedsv/hookli?style=flat-square&color=0A0D12" alt="GitHub stars" /></a>
  <a href="https://github.com/sponsors/saifmohamedsv"><img src="https://img.shields.io/badge/sponsor-61DAFB?style=flat-square&logo=githubsponsors&logoColor=0A0D12" alt="Sponsor" /></a>
  <img src="https://img.shields.io/npm/l/hookli?style=flat-square&color=354355" alt="license" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/zero_dependencies-61DAFB?style=for-the-badge" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/TypeScript-0A0D12?style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SSR--safe-61DAFB?style=for-the-badge" alt="SSR-safe" />
  <img src="https://img.shields.io/badge/tree--shakable-0A0D12?style=for-the-badge" alt="tree-shakable" />
  <img src="https://img.shields.io/badge/ESM_%2B_CJS-61DAFB?style=for-the-badge" alt="ESM + CJS" />
  <img src="https://img.shields.io/badge/65_hooks-0A0D12?style=for-the-badge" alt="65 hooks" />
</p>

<p align="center">
  <a href="#-available-hooks"><strong>Browse the hooks &rarr;</strong></a>
</p>

<p align="center"><sub>Created by <a href="https://linkedin.com/in/saifmohamedsv/">Saif Mohamed</a> · ISC licensed</sub></p>

## 🚀 Install

```bash
npm i hookli
# or
yarn add hookli
# or
pnpm add hookli
```

> **Peer dependency:** React `>=18`.

## 💫 Introduction

**hookli** is a React hooks library, written in TypeScript and easy to use. It gives you a
small, dependency-free set of the hooks you reach for in almost every project — so you stop
re-writing the same debounce, `localStorage` wrapper, or outside-click listener for the
hundredth time. The hooks are built on the principle of DRY (Don't Repeat Yourself).

The library is designed to be as minimal as possible. It is fully **tree-shakable** (via the
ESM build), meaning you only ship the hooks you import and the rest is removed from your
bundle — the cost of adding hookli is negligible. Every hook is **typed** and **SSR-safe**,
so it drops straight into Next.js / Remix.

### Usage

```tsx
import { useLocalStorage } from "hookli";

function Component() {
  const { value, setStoredValue } = useLocalStorage("my-key", 0);

  // ...
}
```

## 🪝 Available hooks

> 📚 Full docs with a **page per hook** and **live demos**: <https://hookli.vercel.app/docs>

- **[`useToggle`](https://hookli.vercel.app/docs/use-toggle)** — Boolean state with toggle and explicit set.
- **[`useForm`](https://hookli.vercel.app/docs/use-form)** — Controlled form state with one change handler.
- **[`useLocalStorage`](https://hookli.vercel.app/docs/use-local-storage)** — State persisted to localStorage.
- **[`useLocalStorageWithExpiry`](https://hookli.vercel.app/docs/use-local-storage-with-expiry)** — Persisted state with a TTL.
- **[`useSessionStorage`](https://hookli.vercel.app/docs/use-session-storage)** — useState backed by sessionStorage, synced across tabs.
- **[`useReadLocalStorage`](https://hookli.vercel.app/docs/use-read-local-storage)** — Read a localStorage key without writing it, reactively.
- **[`useDarkMode`](https://hookli.vercel.app/docs/use-dark-mode)** — Dark-mode boolean with toggle.
- **[`useTernaryDarkMode`](https://hookli.vercel.app/docs/use-ternary-dark-mode)** — Three-state dark mode — system, dark or light — persisted.
- **[`useBoolean`](https://hookli.vercel.app/docs/use-boolean)** — Boolean state with setTrue, setFalse, toggle and set.
- **[`useCounter`](https://hookli.vercel.app/docs/use-counter)** — Numeric counter with increment, decrement and reset.
- **[`useStep`](https://hookli.vercel.app/docs/use-step)** — 1-indexed step counter for wizards and steppers.
- **[`useCountdown`](https://hookli.vercel.app/docs/use-countdown)** — Self-stopping countdown or count-up timer.
- **[`useMap`](https://hookli.vercel.app/docs/use-map)** — Manage a Map as immutable React state.
- **[`useDebounce`](https://hookli.vercel.app/docs/use-debounce)** — Debounces a changing value.
- **[`useDebounceValue`](https://hookli.vercel.app/docs/use-debounce-value)** — State whose debounced copy updates after a pause.
- **[`useDebounceCallback`](https://hookli.vercel.app/docs/use-debounce-callback)** — Debounces a callback, with cancel, flush and isPending.
- **[`useInterval`](https://hookli.vercel.app/docs/use-interval)** — Runs a callback on a fixed interval; pause by passing null.
- **[`useTimeout`](https://hookli.vercel.app/docs/use-timeout)** — Runs a callback once after a delay; cancel by passing null.
- **[`useIsomorphicLayoutEffect`](https://hookli.vercel.app/docs/use-isomorphic-layout-effect)** — useLayoutEffect on the client, useEffect on the server.
- **[`useEventCallback`](https://hookli.vercel.app/docs/use-event-callback)** — A stable callback that always calls the latest closure.
- **[`useUnmount`](https://hookli.vercel.app/docs/use-unmount)** — Runs a cleanup function once, when the component unmounts.
- **[`useIsClient`](https://hookli.vercel.app/docs/use-is-client)** — Reports false on the server and true after hydration.
- **[`useIsMounted`](https://hookli.vercel.app/docs/use-is-mounted)** — A stable getter for whether the component is still mounted.
- **[`useDocumentTitle`](https://hookli.vercel.app/docs/use-document-title)** — Keeps document.title in sync with a value, SSR-safe.
- **[`useEventListener`](https://hookli.vercel.app/docs/use-event-listener)** — Subscribe to a window, document or element event with cleanup.
- **[`useClickOutside`](https://hookli.vercel.app/docs/use-click-outside)** — Runs a callback on outside click.
- **[`useMousePosition`](https://hookli.vercel.app/docs/use-mouse-position)** — Cursor coordinates within an element.
- **[`useInfiniteScroll`](https://hookli.vercel.app/docs/use-infinite-scroll)** — Triggers loading near the scroll end.
- **[`useExpandableText`](https://hookli.vercel.app/docs/use-expandable-text)** — Collapse long text by a character and/or line budget with a show-more toggle.
- **[`useHover`](https://hookli.vercel.app/docs/use-hover)** — Tracks whether the pointer is hovering an element.
- **[`useIntersectionObserver`](https://hookli.vercel.app/docs/use-intersection-observer)** — Observe an element's viewport intersection reactively.
- **[`useResizeObserver`](https://hookli.vercel.app/docs/use-resize-observer)** — Measure an element's size reactively via ResizeObserver.
- **[`useScrollLock`](https://hookli.vercel.app/docs/use-scroll-lock)** — Lock and restore scrolling on the body or an element.
- **[`useClickAnyWhere`](https://hookli.vercel.app/docs/use-click-any-where)** — Run a handler on every click anywhere in the document.
- **[`useMediaQuery`](https://hookli.vercel.app/docs/use-media-query)** — Tracks whether a CSS media query currently matches.
- **[`useScreen`](https://hookli.vercel.app/docs/use-screen)** — Tracks window.screen, refreshing it on every resize.
- **[`useWindowSize`](https://hookli.vercel.app/docs/use-window-size)** — Tracks the viewport's { width, height }, updated on resize.
- **[`useCopyToClipboard`](https://hookli.vercel.app/docs/use-copy-to-clipboard)** — Copy text to the clipboard, tracking the last copied value.
- **[`useScript`](https://hookli.vercel.app/docs/use-script)** — Load an external script and report its load status.
- **[`useFetch`](https://hookli.vercel.app/docs/use-fetch)** — Declarative fetch with loading and error status.
- **[`useGeoLocation`](https://hookli.vercel.app/docs/use-geo-location)** — Browser geolocation state.
- **[`usePrevious`](https://hookli.vercel.app/docs/use-previous)** — Track a value from the previous render.
- **[`useList`](https://hookli.vercel.app/docs/use-list)** — Array state with push, insert, update, remove, and clear helpers.
- **[`useSet`](https://hookli.vercel.app/docs/use-set)** — Set state with add, remove, toggle, has, and clear helpers.
- **[`useThrottle`](https://hookli.vercel.app/docs/use-throttle)** — Throttle a fast-changing value to at most one update per interval.
- **[`useUpdateEffect`](https://hookli.vercel.app/docs/use-update-effect)** — A useEffect that skips the initial mount and runs only on updates.
- **[`useEffectOnce`](https://hookli.vercel.app/docs/use-effect-once)** — Run an effect exactly once, on mount.
- **[`useKeyPress`](https://hookli.vercel.app/docs/use-key-press)** — Track whether a specific key is currently held down.
- **[`useWindowScroll`](https://hookli.vercel.app/docs/use-window-scroll)** — Track the window scroll position reactively.
- **[`useAsync`](https://hookli.vercel.app/docs/use-async)** — Run an async function and track its loading, error, and value state.
- **[`useMutation`](https://hookli.vercel.app/docs/use-mutation)** — Run an async write action on demand and track status, data, and error.
- **[`usePagination`](https://hookli.vercel.app/docs/use-pagination)** — Page, page size, total pages, navigation helpers, and the current item range.
- **[`useNetworkState`](https://hookli.vercel.app/docs/use-network-state)** — Track online/offline status and connection details.
- **[`usePageVisibility`](https://hookli.vercel.app/docs/use-page-visibility)** — Track whether the page/tab is currently visible.
- **[`useIdle`](https://hookli.vercel.app/docs/use-idle)** — Detect user inactivity after a configurable threshold.
- **[`useQueue`](https://hookli.vercel.app/docs/use-queue)** — FIFO queue state with add, remove, clear, and first/last/size.
- **[`useDefault`](https://hookli.vercel.app/docs/use-default)** — useState that falls back to a default when the value is nullish.
- **[`useRafState`](https://hookli.vercel.app/docs/use-raf-state)** — useState whose updates are batched to the next animation frame.
- **[`useDeepCompareEffect`](https://hookli.vercel.app/docs/use-deep-compare-effect)** — useEffect that compares dependencies by deep structural equality.
- **[`useTextSelection`](https://hookli.vercel.app/docs/use-text-selection)** — Track the text the user has currently selected on the page.
- **[`useLongPress`](https://hookli.vercel.app/docs/use-long-press)** — Detect a long press (mouse or touch) via spreadable handlers.
- **[`useHotkeys`](https://hookli.vercel.app/docs/use-hotkeys)** — Bind a keyboard shortcut combo (e.g. ctrl+k) to a callback.
- **[`useFullscreen`](https://hookli.vercel.app/docs/use-fullscreen)** — Control the Fullscreen API for an element and track its state.
- **[`useBattery`](https://hookli.vercel.app/docs/use-battery)** — Read device battery level and charging state (where supported).
- **[`usePermission`](https://hookli.vercel.app/docs/use-permission)** — Query a Permissions API permission and track its state.

## 🧪 TypeScript

Every hook ships its own declarations — no `@types/hookli` needed. Data hooks are generic,
so inference flows through:

```tsx
const { data } = useFetch<Product[]>("/api/products"); // data: Product[] | null
const debounced = useDebounce(query, 300); // debounced: typeof query
```

## 💖 Support hookli

hookli is free and open source, built and maintained in the open. If it saves you time:

- ⭐ **[Star the repo](https://github.com/saifmohamedsv/hookli)** — it's the #1 way to help others find it.
- 💖 **[Become a sponsor](https://github.com/sponsors/saifmohamedsv)** — fund ongoing maintenance and new hooks.

Every star and sponsorship genuinely helps keep this going. Thank you! 🙏

## 🤝 Contributing

Contributions of any size are welcome — see **[CONTRIBUTING.md](https://github.com/saifmohamedsv/hookli/blob/main/CONTRIBUTING.md)**. In short:
each hook lives in its own folder under `src/hooks/use-<name>/` (hook + colocated vitest test +
barrel), keep it SSR-safe, and make sure `bash ralph/check.sh` (typecheck + tests + build) is green.

## 📄 License

ISC © [Saif Mohamed](https://linkedin.com/in/saifmohamedsv/)
