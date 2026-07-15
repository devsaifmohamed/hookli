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
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/v/hookli?style=flat-square&color=003748" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dm/hookli?style=flat-square&color=30C5CA&label=downloads%2Fmonth" alt="npm downloads per month" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dt/hookli?style=flat-square&color=003748&label=total%20downloads" alt="total npm downloads" /></a>
  <a href="https://bundlephobia.com/package/hookli"><img src="https://img.shields.io/bundlephobia/minzip/hookli?style=flat-square&color=30C5CA" alt="minzipped size" /></a>
  <a href="https://github.com/saifmohamedsv/hookli"><img src="https://img.shields.io/github/stars/saifmohamedsv/hookli?style=flat-square&color=003748" alt="GitHub stars" /></a>
  <a href="https://github.com/sponsors/saifmohamedsv"><img src="https://img.shields.io/badge/sponsor-30C5CA?style=flat-square&logo=githubsponsors&logoColor=white" alt="Sponsor" /></a>
  <img src="https://img.shields.io/npm/l/hookli?style=flat-square&color=8FB6C2" alt="license" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/zero_dependencies-30C5CA?style=for-the-badge" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/TypeScript-003748?style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SSR--safe-30C5CA?style=for-the-badge" alt="SSR-safe" />
  <img src="https://img.shields.io/badge/tree--shakable-003748?style=for-the-badge" alt="tree-shakable" />
  <img src="https://img.shields.io/badge/ESM_%2B_CJS-30C5CA?style=for-the-badge" alt="ESM + CJS" />
  <img src="https://img.shields.io/badge/11_hooks-003748?style=for-the-badge" alt="11 hooks" />
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

> 📚 A dedicated docs site with a **page per hook** and **live demos** is on the way. For
> now, each hook links to its source.

- **[`useToggle`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-toggle/use-toggle.ts)** — boolean state with a `toggle()` and an explicit setter.
- **[`useBoolean`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-boolean/use-boolean.ts)** — boolean state with `setTrue` / `setFalse` / `toggle` helpers.
- **[`useCounter`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-counter/use-counter.ts)** — numeric counter with `increment` / `decrement` / `reset` / `setCount`.
- **[`useStep`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-step/use-step.ts)** — 1-indexed step counter for wizards, with next/prev guards.
- **[`useCountdown`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-countdown/use-countdown.ts)** — self-stopping countdown/count-up timer with start/stop/reset.
- **[`useInterval`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-interval/use-interval.ts)** — run a callback on a fixed interval; pass `null` delay to pause.
- **[`useTimeout`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-timeout/use-timeout.ts)** — run a callback once after a delay; pass `null` delay to cancel.
- **[`useIsomorphicLayoutEffect`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-isomorphic-layout-effect/use-isomorphic-layout-effect.ts)** — `useLayoutEffect` on the client, `useEffect` on the server.
- **[`useEventCallback`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-event-callback/use-event-callback.ts)** — a stable callback identity that always calls the latest function.
- **[`useEventListener`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-event-listener/use-event-listener.ts)** — typed `addEventListener` for window/document/element/media-query targets.
- **[`useUnmount`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-unmount/use-unmount.ts)** — run a cleanup function once, on unmount.
- **[`useDebounce`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-debounce/use-debounce.ts)** — returns a debounced version of a fast-changing value.
- **[`useFetch`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-fetch/use-fetch.ts)** — fetches JSON and tracks `data` / `error` / `loading` state.
- **[`useForm`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-form/use-form.ts)** — minimal controlled-form state with a generic change handler.
- **[`useLocalStorage`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-local-storage/use-local-storage.ts)** — persists state to `localStorage`, `useState`-style.
- **[`useLocalStorageWithExpiry`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-local-storage-with-expiry/use-local-storage-with-expiry.ts)** — persisted state that expires after a TTL.
- **[`useDarkMode`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-dark-mode/use-dark-mode.ts)** — toggles a `dark` class on `<body>` and persists the theme.
- **[`useClickOutside`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-click-outside/use-click-outside.ts)** — fires a callback on clicks outside a ref'd element.
- **[`useMousePosition`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-mouse-position/use-mouse-position.ts)** — tracks the cursor `{ x, y }` within an element.
- **[`useInfiniteScroll`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-infinite-scroll/use-infinite-scroll.ts)** — runs a loader when the page nears the bottom.
- **[`useGeoLocation`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/use-geo-location/use-geo-location.ts)** — reads the user's coordinates via the Geolocation API.

## 🧪 TypeScript

Every hook ships its own declarations — no `@types/hookli` needed. Data hooks are generic,
so inference flows through:

```tsx
const { data } = useFetch<Product[]>("/api/products"); // data: Product[] | null
const debounced = useDebounce(query, 300);              // debounced: typeof query
```

## 💖 Support hookli

hookli is free and open source, built and maintained in the open. If it saves you time:

- ⭐ **[Star the repo](https://github.com/saifmohamedsv/hookli)** — it's the #1 way to help others find it.
- 💖 **[Become a sponsor](https://github.com/sponsors/saifmohamedsv)** — fund ongoing maintenance and new hooks.

Every star and sponsorship genuinely helps keep this going. Thank you! 🙏

## 🤝 Contributing

Contributions of any size are welcome — see **[CONTRIBUTING.md](./CONTRIBUTING.md)**. In short:
each hook lives in its own folder under `src/hooks/use-<name>/` (hook + colocated vitest test +
barrel), keep it SSR-safe, and make sure `bash ralph/check.sh` (typecheck + tests + build) is green.

## 📄 License

ISC © [Saif Mohamed](https://linkedin.com/in/saifmohamedsv/)
