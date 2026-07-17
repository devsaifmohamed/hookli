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

> **Premium Dark v1.0 (2026-07-17).** A cool near-black refinement of the React palette. The
> page drops to a near-black, slightly cool `#0A0D12`; cards lift only ~6% to `#10151D` and
> hover/nested washes rise a further step to `#151C27`. Because adjacent surfaces are so close,
> **elevation comes from an edge, not a fill** — a solid frame border + a 1px top highlight +
> an ambient shadow (see §Elevation). The accent stays classic React cyan `#61DAFB`, lifting to
> `#7CE2FF` on hover. Assets in `public/` (lifted `#151C27` chip tile w/ 1px top-edge highlight,
> React-cyan hook cradling a white state dot, `hookli.` wordmark) are the source.
> **Intentional divergence:** OG / apple-icon use a slight surface-1 lift (`#10151D`, apple-icon
> `#151C27`) so social embeds aren't a pure-black void when a client crops/shadows the card; the
> site's page ground is the true near-black `#0A0D12` — don't "sync" them.
> The banner (`hookli-banner.svg/.png`, mirrored in root `assets/`) bakes the hook count in
> at authoring time from `packages/hookli/hooks.manifest.json` — regenerate the banner (SVG
> text + PNG re-render at 2400×800) whenever the hook count changes. Its sans stack leads with the
> brand font **Plus Jakarta Sans** (embedded in the SVG as data-URI woff2 so the PNG render and
> standalone SVG match the site), falling back to the previous Geist/Avenir stack.

| Token | Value | CSS var | Tailwind name | Use |
|---|---|---|---|---|
| Ground | `#0A0D12` | `--color-ground` | `ground` | Page background + inset wells (near-black, cool — the anchor; code interiors and in-card inputs cut back to it) |
| Ground raised | `#10151D` | `--color-ground-raised` | `ground-raised` | Cards, code frames, sidebar drawer (~6% lift off the page) |
| Ground overlay | `#151C27` | `--color-ground-overlay` | `ground-overlay` | Hover / nested / elevated **surface** wash on raised (the top step — a fill tone, NOT a border) |
| Accent | `#61DAFB` | `--color-accent` | `accent` | Links, CTAs, wordmark full stop, focus rings (classic React cyan — text-grade) |
| Accent hover | `#7CE2FF` | `--color-accent-hover` | `accent-hover` | CTA / link hover — brighter cyan |
| Brand | `#087EA4` | `--color-brand` | `brand` | react.dev brand teal — **large decorative fills only** (fails AA for text/small UI); currently unused |
| Syntax slate | `#354355` | `--color-slate-syntax` | `slate-syntax` | **FRAME edge** — solid 1px card / code-window / major-chrome borders (the visible edge); never text |
| Divider | `#242D3A` | `--color-divider` | `divider` | **QUIET row divider** — near-invisible rules inside dense lists/tables (readout rows, list rows) |
| Gray outline | `#697586` | `--color-gray-outline` | `gray-outline` | **INTERACTIVE outline** — outline buttons, inputs, toggles (the only tier ≥3:1 non-text on every surface; chrome, never copy) |
| Gray | `#9BA8B8` | `--color-gray-body` | `gray-body` | Secondary/muted text (AA on every surface, min 6.5:1) |
| Foreground | `#FFFFFF` | `--color-fg` | `fg` | Primary/body text (pure white) |
| Accent-ink | `#0A0D12` | — | `ground` | Text on accent-filled buttons |

Rules: **solid colors only — no gradients** on brand surfaces. Dark-first; no light
theme in v1. Elevation is carried by an **edge + 1px top highlight + ambient shadow**, not a
fill — adjacent surfaces are only ~6% apart, so a solid frame border is what separates a card
from the page. Borders have **three roles**: **FRAME** (card/code-window edges, section rules,
kbd chips, major chrome) uses full-strength `border-slate-syntax` (`#354355`, crisp 1px — the
visible structural edge, never text); **QUIET row dividers inside a card** (readout rows, list
rows) use `border-divider` (`#242D3A` — near-invisible, so dividers never carry frame weight;
NOTE `ground-overlay` is now a surface *fill* tone and must never be used as a border);
**INTERACTIVE outlines** (outline buttons, inputs, toggle frames, the search trigger) use
`border-gray-outline` (`#697586` — ≥3:1 non-text on every surface), stepping up to
`border-gray-body` on hover and `border-accent` for active/pressed states.
Accent is used sparingly: one primary CTA per viewport, links, active nav states — hover lifts
to `accent-hover` (`#7CE2FF`). `#61DAFB` is the only text-grade brand hue; `#087EA4` never
carries text or small UI. Slate-syntax, divider, and gray-outline are chrome, never text —
with one carve-out: on the light `bg-slate-50` demo panels (the dark-mode demos),
`text-slate-syntax` is the correct copy color (~9:1 there; gray-body would be too faint).
Those call sites are commented — don't sweep them. `#9BA8B8` (gray-body) is the copy floor —
never go darker than that for copy (gray-outline `#697586` is chrome, not copy).

### Typography
- **Headings + wordmark + UI:** Plus Jakarta Sans (Avenir-class geometric) via
  `next/font/local` from `@fontsource/plus-jakarta-sans` (400/600/700). CSS var
  `--font-sans`; headings weight 600, `letter-spacing: -0.02em`.
- **Code only:** JetBrains Mono (`--font-mono`) — code blocks, commands, identifiers,
  signatures, API type cells, kbd. Monospace is never used for UI copy, nav, buttons,
  or headings.
- Wordmark treatment (component `Wordmark`): `hookli` lowercase in ink `#F6F7F9` +
  full stop in accent `#61DAFB`, sans 600, `tracking-tight`. The mark (`HookMark`,
  same file) is the icon's hook + dot without the tile. The old `use(hookli)` mono
  lockup is retired.
- Scale: h1 `text-4xl/5xl` sans 600 · h2 `text-2xl` sans 600 · h3 `text-lg` sans 600 ·
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

1. **Hero** — the hook mark (`HookMark`) stacked above a big `hookli.` wordmark
   (brand v3; the mono `use(hookli)` + cursor-blink treatment is retired).
   Tagline: *"Simple React hooks. Typed. SSR-safe. Zero dependencies."*
   Install box: `npm i hookli` with copy button (icon flips to check for 2s).
   Primary CTA button (accent fill): **Explore the docs** → `/docs`.
   Secondary text link: **Star on GitHub** →  repo.
2. **Feature grid** — 6 cards, 3×2 desktop / 2×3 tablet / 1-col mobile: Zero
   dependencies, TypeScript-first, SSR-safe, Tree-shakable, ESM + CJS, 11 hooks &
   counting. Each: SVG icon, sans title, one-sentence body.
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
   `ground-raised` card, solid slate border, 12px radius, min-height 180px; the
   Code tab pane is an inset well (`bg-ground`). Error boundary inside so a
   crashing demo never kills the page.
4. **Usage**: heading + `CodeBlock` with the copyable snippet (same code as the
   demo's Code tab).
5. **API**: signature line in a code strip, then Parameters table
   (Name / Type / Default / Description) and Returns table (Name / Type / Description).
6. **Source link**: "View source on GitHub" → `https://github.com/saifmohamedsv/hookli`
   (repo root — per-file deep links only if the path is verified).
7. **Prev / Next** pager across the registry order.

Right-side table of contents: added in T16 (`components/on-this-page.tsx`) — an "On this
page" scroll-spy rail (Demo / Usage / API / Hook), hidden below `xl`, with a T12 support
slot beneath it. Every hook page also embeds its implementation source (**Hook** section,
`lib/hook-sources.ts`) with a view-on-GitHub link, per the usehooks-ts anatomy parity in T16.

---

## 5. Component inventory

| Component | Type | Notes |
|---|---|---|
| `Header` | server | sticky, ground/90 + backdrop-blur, wordmark, nav, search trigger, GitHub |
| `Footer` | server | links, license, mini install command |
| `Wordmark` | server | `hookli.` lockup (ink + accent stop); `size` prop; also exports `HookMark` |
| `Sidebar` | client | category groups, active link state, collapses to drawer <768px (T14) |
| `HookDemo` | client | tabs Preview/Code, error boundary, consistent frame |
| `DemoErrorBoundary` | client | class component, branded fallback |
| `CodeBlock` | server | shiki (`css-variables` theme wired to brand tokens) + CopyButton |
| `CopyButton` | client | clipboard API, check-icon feedback, `aria-live="polite"` |
| `InstallCommand` | client | `$ npm i hookli` + CopyButton, used in hero/footer/docs index |
| `FeatureCard` | server | icon + sans title + body |
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
- Micro-interactions 150–300ms ease-out. `prefers-reduced-motion: reduce` kills all
  animations and transitions (global CSS guard).
- Contrast: body `#FFFFFF` / muted `#9BA8B8` on every surface (≥4.5:1 — gray-body clears
  6.5:1 on the darkest surface); accent `#61DAFB` is text-grade on ground; `#087EA4` is
  decorative only; slate-syntax (frame), divider (row rules), and gray-outline are chrome,
  not text; interactive outlines (`gray-outline` `#697586`) hit ≥3:1 non-text on every surface.
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
