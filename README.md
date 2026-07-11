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
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/v/hookli?style=flat-square&color=6366f1" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dm/hookli?style=flat-square&color=22d3ee" alt="npm downloads per month" /></a>
  <a href="https://www.npmjs.com/package/hookli"><img src="https://img.shields.io/npm/dt/hookli?style=flat-square&color=38bdf8" alt="total npm downloads" /></a>
  <a href="https://bundlephobia.com/package/hookli"><img src="https://img.shields.io/bundlephobia/minzip/hookli?style=flat-square&color=818cf8" alt="minzipped size" /></a>
  <a href="https://github.com/saifmohamedsv/hookli"><img src="https://img.shields.io/github/stars/saifmohamedsv/hookli?style=flat-square&color=c084fc" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/npm/l/hookli?style=flat-square&color=94a3b8" alt="license" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/zero_dependencies-22d3ee?style=for-the-badge" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/TypeScript-818cf8?style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SSR--safe-c084fc?style=for-the-badge" alt="SSR-safe" />
  <img src="https://img.shields.io/badge/tree--shakable-22d3ee?style=for-the-badge" alt="tree-shakable" />
  <img src="https://img.shields.io/badge/ESM_%2B_CJS-818cf8?style=for-the-badge" alt="ESM + CJS" />
  <img src="https://img.shields.io/badge/11_hooks-c084fc?style=for-the-badge" alt="11 hooks" />
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

- **[`useToggle`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useToggle.hook.ts)** — boolean state with a `toggle()` and an explicit setter.
- **[`useDebounce`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useDebounce.hook.ts)** — returns a debounced version of a fast-changing value.
- **[`useFetch`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useFetch.hook.ts)** — fetches JSON and tracks `data` / `error` / `loading` state.
- **[`useForm`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useForm.hook.ts)** — minimal controlled-form state with a generic change handler.
- **[`useLocalStorage`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useLocalStorage.hook.ts)** — persists state to `localStorage`, `useState`-style.
- **[`useLocalStorageWithExpiry`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useLocalStorageWithExpiry.hook.ts)** — persisted state that expires after a TTL.
- **[`useDarkMode`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useDarkMode.hook.ts)** — toggles a `dark` class on `<body>` and persists the theme.
- **[`useClickOutside`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useClickOutside.hook.ts)** — fires a callback on clicks outside a ref'd element.
- **[`useMousePosition`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useMousePosition.hook.ts)** — tracks the cursor `{ x, y }` within an element.
- **[`useInfiniteScroll`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useInfiniteScroll.hook.ts)** — runs a loader when the page nears the bottom.
- **[`useGeoLocation`](https://github.com/saifmohamedsv/hookli/blob/main/src/hooks/useGeoLocation.hook.ts)** — reads the user's coordinates via the Geolocation API.

## 🧪 TypeScript

Every hook ships its own declarations — no `@types/hookli` needed. Data hooks are generic,
so inference flows through:

```tsx
const { data } = useFetch<Product[]>("/api/products"); // data: Product[] | null
const debounced = useDebounce(query, 300);              // debounced: typeof query
```

## 🤝 Contributing

Issues and PRs are welcome. Add a hook as `src/hooks/use<Name>.hook.ts`, export it from
`src/hooks/index.ts`, keep it SSR-safe, and make sure `npx tsc --noEmit` and `yarn build`
are both green.

## 📄 License

ISC © [Saif Mohamed](https://linkedin.com/in/saifmohamedsv/)
