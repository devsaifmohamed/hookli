<p align="center">
  <a href="https://www.npmjs.com/package/hookio">
    <img src="https://raw.githubusercontent.com/use-any-hook/use-any-hook/main/assets/hookio-banner.svg" alt="hook.io — React hooks, ready to use" width="680" />
  </a>
</p>

<h1 align="center">hook.io</h1>

<p align="center">
  A tiny, typed collection of the React hooks you reach for every day.<br/>
  <strong>Zero dependencies · SSR-safe · ESM + CJS · fully tree-shakable.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hookio"><img src="https://img.shields.io/npm/v/hookio?style=flat-square&color=6366f1" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/hookio"><img src="https://img.shields.io/npm/dm/hookio?style=flat-square&color=22d3ee" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/hookio"><img src="https://img.shields.io/bundlephobia/minzip/hookio?style=flat-square&color=818cf8" alt="minzipped size" /></a>
  <img src="https://img.shields.io/npm/types/hookio?style=flat-square&color=c084fc" alt="TypeScript types included" />
  <img src="https://img.shields.io/npm/l/hookio?style=flat-square&color=94a3b8" alt="license" />
</p>

---

## 💫 Why hook.io

Every React project ends up re-writing the same handful of hooks — a debounce here, a
`localStorage` wrapper there, an outside-click listener for the third time this month.
**hook.io** is that boilerplate, extracted once, typed properly, and hardened for real apps.

- **📦 Zero runtime dependencies** — nothing but React ships to your users.
- **🌳 Tree-shakable** — import one hook, bundle one hook. The rest never leaves `node_modules`.
- **🧠 TypeScript-first** — every hook is generic where it counts; full inference, no `any` leaks.
- **🖥️ SSR-safe** — browser globals are guarded, so it just works in Next.js / Remix.
- **🎯 Familiar APIs** — hooks mirror the `useState` shape you already know.
- **⚡ Dual module** — ships ESM **and** CommonJS with `.d.ts` types for both.

## 🚀 Install

```bash
npm i hookio
# or
yarn add hookio
# or
pnpm add hookio
```

> **Peer dependency:** React `>=18`.

```tsx
import { useDebounce, useToggle, useClickOutside } from "hookio";
```

## 🪝 Available hooks

| Hook | What it does |
| --- | --- |
| [`useToggle`](#usetoggle) | Boolean state with `toggle()` and explicit `set()`. |
| [`useDebounce`](#usedebounce) | Debounce any fast-changing value. |
| [`useFetch`](#usefetch) | Fetch JSON with `data` / `error` / `loading` state. |
| [`useForm`](#useform) | Minimal controlled-form state + change handler. |
| [`useLocalStorage`](#uselocalstorage) | `useState` that persists to `localStorage`. |
| [`useLocalStorageWithExpiry`](#uselocalstoragewithexpiry) | Persisted state that expires after a TTL. |
| [`useDarkMode`](#usedarkmode) | Toggle a `dark` class + persisted theme. |
| [`useClickOutside`](#useclickoutside) | Fire a callback on clicks outside a ref. |
| [`useMousePosition`](#usemouseposition) | Track the cursor `{ x, y }` inside an element. |
| [`useInfiniteScroll`](#useinfinitescroll) | Call a loader when the page nears the bottom. |
| [`useGeoLocation`](#usegeolocation) | Read the user's coordinates (with permission). |

## 📖 Usage

### useToggle
```tsx
import { useToggle } from "hookio";

function Panel() {
  const [isOpen, toggle, setOpen] = useToggle(false);

  return (
    <>
      <button onClick={toggle}>{isOpen ? "Hide" : "Show"}</button>
      <button onClick={() => setOpen(false)}>Force close</button>
      {isOpen && <div>Now you see me.</div>}
    </>
  );
}
```

### useDebounce
```tsx
import { useState } from "react";
import { useDebounce } from "hookio";

function Search() {
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 400); // waits 400ms after the last keystroke

  // Fire the request only when `debounced` settles.
  // useEffect(() => { fetch(`/api?q=${debounced}`) }, [debounced]);

  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}
```

### useFetch
```tsx
import { useFetch } from "hookio";

type User = { id: number; name: string };

function Users() {
  const { data, error, loading } = useFetch<User[]>("/api/users");

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <ul>{data?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### useClickOutside
```tsx
import { useRef } from "react";
import { useClickOutside } from "hookio";

function Dropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  return <div ref={ref}>…menu…</div>;
}
```

### useLocalStorage
```tsx
import { useLocalStorage } from "hookio";

function Settings() {
  const { value, setStoredValue } = useLocalStorage("volume", 50);
  return <input type="range" value={value} onChange={(e) => setStoredValue(Number(e.target.value))} />;
}
```

### useDarkMode
```tsx
import { useDarkMode } from "hookio";

function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode(); // toggles a `dark` class on <body>
  return <button onClick={toggleDarkMode}>{isDarkMode ? "🌙" : "☀️"}</button>;
}
```

<details>
<summary>More hooks — <code>useForm</code>, <code>useMousePosition</code>, <code>useInfiniteScroll</code>, <code>useGeoLocation</code>, <code>useLocalStorageWithExpiry</code></summary>

### useForm
```tsx
import { useForm } from "hookio";

const { values, handleChange, resetForm } = useForm({ email: "", name: "" });
// <input name="email" value={values.email} onChange={handleChange} />
```

### useMousePosition
```tsx
import { useRef } from "react";
import { useMousePosition } from "hookio";

const ref = useRef<HTMLDivElement>(null);
const { x, y } = useMousePosition(ref); // relative to the element
```

### useInfiniteScroll
```tsx
import { useInfiniteScroll } from "hookio";

const isFetching = useInfiniteScroll(async () => {
  await loadNextPage(); // called when the viewport nears the bottom
});
```

### useGeoLocation
```tsx
import { useGeoLocation } from "hookio";

const { location, error } = useGeoLocation();
// location?.coords.latitude / location?.coords.longitude
```

### useLocalStorageWithExpiry
```tsx
import { useLocalStorageWithExpiry } from "hookio";

const { value, setStoredValue } = useLocalStorageWithExpiry("token", null, 3600_000); // 1h TTL
```
</details>

## 🧪 TypeScript

Every hook is written in TypeScript and ships its own declarations — no `@types/hookio`
needed. Data hooks are generic, so inference flows through:

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
