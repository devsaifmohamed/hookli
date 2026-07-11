# hookli-docs — Design Source of Truth

Produced by T1 (2026-07-11). Every later task builds from this document without
re-deciding. Benchmarks studied: **usehooks-ts.com** (landing formula, hook-page
anatomy), **mantine.dev/hooks** (demo-first polish, category sidebar),
**react-use** (cautionary tale: README-only docs → poor discoverability, no live
demos). hookli-docs takes usehooks-ts's structure, Mantine's demo polish, and adds
what all three lack on brand: a code-first hero that proves the library live.

---

## 1. Brand tokens

Defined as CSS variables in `app/globals.css` and wired into Tailwind v4 via the
`@theme` directive (Tailwind 4 has no `tailwind.config.ts` theme — tokens live in CSS).

| Token | Value | CSS var | Tailwind name | Use |
|---|---|---|---|---|
| Ground | `#0B1120` | `--color-ground` | `ground` | Page + surface background |
| Ground raised | `#111A2E` | `--color-ground-raised` | `ground-raised` | Cards, code frames, sidebar |
| Accent | `#61DAFB` | `--color-accent` | `accent` | Links, CTAs, wordmark name, focus rings |
| Syntax slate | `#475569` | `--color-slate-syntax` | `slate-syntax` | Wordmark parens, borders, muted UI |
| Gray | `#94A3B8` | `--color-gray-body` | `gray-body` | Secondary/body text |
| Foreground | `#E2E8F0` | `--color-fg` | `fg` | Primary text (AA on ground: 12.6:1) |
| Accent-ink | `#0B1120` | — | `ground` | Text on accent-filled buttons |

Rules: **solid colors only — no gradients** on brand surfaces. Dark-first; no light
theme in v1. Borders are `--color-slate-syntax` at 40% opacity (`border-slate-syntax/40`).
Accent is used sparingly: one primary CTA per viewport, links, active nav states.
`#94A3B8` on `#0B1120` is 7.5:1 — safe for body text; never go darker than that for copy.

### Typography
- **Headings + wordmark + code:** monospace via `next/font` — `JetBrains_Mono`
  (Google, variable). CSS var `--font-mono`.
- **Body:** system sans stack (`ui-sans-serif, system-ui, ...`) — no webfont, zero cost.
- Wordmark treatment (component `Wordmark`): `use(` and `)` in slate `#475569`,
  `hookli` in cyan `#61DAFB`, monospace, single line. Never letter-spaced, never bold-ed
  beyond 600.
- Scale: h1 `text-4xl/5xl` mono 600 · h2 `text-2xl` mono 600 · h3 `text-lg` mono 600 ·
  body `text-base` sans · small `text-sm`.

### Iconography
Inline SVG only, lucide-style (24×24 viewBox, `stroke="currentColor"`,
`stroke-width={1.5}`, no fill). No emoji anywhere. If hand-rolling gets heavy,
`lucide-react` is the one approved icon dependency.

---

## 2. Information architecture (sitemap)

```
/                       Landing (hero → features → live proof → hooks index → support → CTA)
/docs                   Docs index: intro, install, quick example, hook cards by category
/docs/[slug]            One page per hook (11 total, statically generated from registry)
/support                Donation placeholder + star/contribute cards
/not-found              Branded 404
```

- `lib/hooks-registry.ts` is the **single source of truth**: sidebar, `/docs` index,
  `generateStaticParams`, search palette, landing "11 hooks" count, sitemap all derive
  from it. Adding a hook = one registry entry + one demo component + one usage snippet.
- `/docs` layout owns the sidebar (left, sticky, grouped by category, active state via
  `usePathname`). Hook pages render inside it.
- Header (global): Wordmark → `/`, `Docs` → `/docs`, search button (⌘K), GitHub icon
  link → `https://github.com/saifmohamedsv/hookli`.
- Footer (global): wordmark, `npm i hookli` mini-command, links: npm package, GitHub,
  ISC license, `/support`.

---

## 3. Landing page — section order (final)

1. **Hero** — big mono headline rendering `use(hookli)` with cyan accent and a blinking
   block cursor (CSS `steps()` animation; disabled under `prefers-reduced-motion`).
   Tagline: *"Simple React hooks. Typed. SSR-safe. Zero dependencies."*
   Install box: `npm i hookli` with copy button (icon flips to check for 2s).
   Primary CTA button (accent fill): **Explore the docs** → `/docs`.
   Secondary text link: **Star on GitHub** →  repo.
2. **Feature grid** — 6 cards, 3×2 desktop / 2×3 tablet / 1-col mobile: Zero
   dependencies, TypeScript-first, SSR-safe, Tree-shakable, ESM + CJS, 11 hooks &
   counting. Each: SVG icon, mono title, one-sentence body.
3. **Live proof** — split section: left = syntax-highlighted `useToggle` sample
   (the exact code), right = that code running live (client component importing
   from `hookli`). Header: "This demo is running the code beside it."
4. **Hooks index strip** — all 11 hooks as compact cards (name mono + one-liner),
   linking to their doc pages. Grouped by category headers.
5. **Support teaser** — one row: star / contribute / sponsor-placeholder → `/support`.
6. **Bottom CTA** — repeat install command + Explore the docs.

---

## 4. Hook page template (anatomy, top → bottom)

Modeled on usehooks-ts's progressive disclosure + Mantine's demo-first ordering:

1. **Breadcrumb-lite**: category label (small, gray).
2. **Title**: hook name, mono h1. **Description**: 1–2 sentences, gray.
3. **Live demo** (`HookDemo` frame): Preview/Code tabs, demo first. Frame =
   `ground-raised` card, slate/40 border, 12px radius, min-height 180px. Error
   boundary inside so a crashing demo never kills the page.
4. **Usage**: heading + `CodeBlock` with the copyable snippet (same code as the
   demo's Code tab).
5. **API**: signature line in a code strip, then Parameters table
   (Name / Type / Default / Description) and Returns table (Name / Type / Description).
6. **Source link**: "View source on GitHub" → `https://github.com/saifmohamedsv/hookli`
   (repo root — per-file deep links only if the path is verified).
7. **Prev / Next** pager across the registry order.

Right-side table of contents: **skipped** in v1 (pages are short); revisit only if a
page exceeds ~3 screens.

---

## 5. Component inventory

| Component | Type | Notes |
|---|---|---|
| `Header` | server | sticky, ground/90 + backdrop-blur, wordmark, nav, search trigger, GitHub |
| `Footer` | server | links, license, mini install command |
| `Wordmark` | server | `use(hookli)` colored spans; `size` prop |
| `Sidebar` | client | category groups, active link state, collapses to drawer <768px (T14) |
| `HookDemo` | client | tabs Preview/Code, error boundary, consistent frame |
| `DemoErrorBoundary` | client | class component, branded fallback |
| `CodeBlock` | server | shiki (`css-variables` theme wired to brand tokens) + CopyButton |
| `CopyButton` | client | clipboard API, check-icon feedback, `aria-live="polite"` |
| `InstallCommand` | client | `$ npm i hookli` + CopyButton, used in hero/footer/docs index |
| `FeatureCard` | server | icon + mono title + body |
| `HookCard` | server | registry entry → linked card |
| `ApiTable` | server | typed rows from the registry page data |
| `SearchPalette` | client | ⌘K dialog over registry (T11) |
| `Icons` | server | one file of inline lucide-style SVGs |

Demos live in `components/demos/<slug>-demo.tsx`, one per hook, all `"use client"`.

---

## 6. Hook registry — canonical data (from `hookli@1.3.16` d.ts, verified)

Categories (sidebar order): **state** → **effects** → **dom** → **data**.

| Slug | Hook | Cat | Signature | One-liner | Demo concept |
|---|---|---|---|---|---|
| `use-toggle` | `useToggle` | state | `useToggle(initialValue?: boolean): [boolean, () => void, (v: boolean) => void]` | Boolean state with toggle and explicit set. | Switch + on/off readout (T6 reference) |
| `use-form` | `useForm` | state | `useForm<T>(initialState: T): { values, handleChange, resetForm }` | Controlled form state with one change handler. | Live form → JSON values panel |
| `use-local-storage` | `useLocalStorage` | state | `useLocalStorage<T>(key, initialValue): { value, setStoredValue }` | State persisted to localStorage. | Input that survives reload |
| `use-local-storage-with-expiry` | `useLocalStorageWithExpiry` | state | `useLocalStorageWithExpiry<T>(key, initialValue, expiryMs): { value, setStoredValue }` | Persisted state with a TTL. | Value + countdown to expiry |
| `use-dark-mode` | `useDarkMode` | state | `useDarkMode(): { isDarkMode, toggleDarkMode }` | Dark-mode boolean with toggle. | Scoped preview panel (never the site theme) |
| `use-debounce` | `useDebounce` | effects | `useDebounce<T>(value: T, delay: number): T` | Debounces a changing value. | Type fast → debounced echo |
| `use-click-outside` | `useClickOutside` | dom | `useClickOutside<T>(ref, callback): void` | Runs a callback on outside click. | Dropdown that closes on outside click |
| `use-mouse-position` | `useMousePosition` | dom | `useMousePosition<T>(ref): { x, y }` | Cursor coordinates within an element. | Bounded tracking panel |
| `use-infinite-scroll` | `useInfiniteScroll` | dom | `useInfiniteScroll(fetchMoreData): boolean` | Triggers loading near scroll end. | Scrollable list appending mock items |
| `use-fetch` | `useFetch` | data | `useFetch<T>(url): { data, loading, error }` | Declarative fetch with status. | jsonplaceholder users + loading/error states |
| `use-geo-location` | `useGeoLocation` | data | `useGeoLocation(): { location, error }` | Browser geolocation state. | Button-gated permission request, graceful denial |

**SSR rule for every demo:** demos are client components; any hook touching
`window`/`localStorage`/`document` renders behind a `mounted` flag
(`useEffect`-set state) so `next build` prerender stays green. `useGeoLocation`
mounts its hook-consuming subtree only after an explicit user click.

---

## 7. Search (T11 spec)

Client-only command palette over the registry — no service, no index build.
⌘K / Ctrl+K and header button open it; fuzzy-ish filter on name + description +
category (lowercase substring match is enough for 11 items). Arrow keys navigate,
Enter routes, Esc closes. Rendered in a portal; focus trap; `role="dialog"` +
`aria-modal`; list uses `role="listbox"`/`option`. Full-screen sheet at <640px.

---

## 8. Interaction, motion, a11y standards

- Focus: visible 2px accent ring (`outline-accent`, offset 2) on every interactive.
- Touch targets ≥44×44px; icon buttons get padding to reach it.
- Micro-interactions 150–300ms ease-out. `prefers-reduced-motion: reduce` kills the
  hero cursor blink and all transitions (global CSS guard).
- Contrast: body `#94A3B8`+ on `#0B1120` (≥4.5:1); UI chrome may use slate.
- Breakpoints checked every task: 375 / 768 / 1024 / 1440. No horizontal scroll at 375.
- Code blocks: `overflow-x-auto`, never wrap-break code.

---

## 9. Next.js 16 build notes (verified against bundled docs)

- `params` in dynamic routes/layouts/`generateMetadata` is a **Promise — `await` it**.
- `themeColor`/`viewport` do **not** go in `metadata` — export `viewport` separately.
- `next/image`: use `preload`, not the deprecated `priority`.
- Tailwind v4: tokens via `@theme` in `globals.css`; no config-file theme.
- Per-hook OG images via `app/docs/[slug]/opengraph-image.tsx` (ImageResponse);
  `app/sitemap.ts` + `app/robots.ts` generated from the registry (T13).
- Root `metadata`: title template `"hookli — %s"`, default `"hookli — simple React hooks"`.

## 10. Dependency policy

Approved when their task lands: **shiki** (T6, highlighting — build-time/server only),
**lucide-react** (only if inline SVGs become a burden). Nothing else without a
progress.txt note. Demos import from **`hookli`** (npm) — never relative paths into
`../rehooks-app`.
