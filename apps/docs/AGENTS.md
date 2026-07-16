<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# hookli-docs

The docs + landing site for **hookli** (`npm i hookli`) — a React hooks library by
@saifmohamedsv (github.com/saifmohamedsv/hookli). This app is a sibling of the library
repo (`../rehooks-app`), which is **read-only context** — never modify it from here.

## Stack
Next.js (App Router, TypeScript, Tailwind, npm). Hooks for live demos are imported from
the **published `hookli` package** (in node_modules), not from relative paths.

## Brand (v4 — the official React palette, dark-first, solid, no gradients)
- Colors are the verified react.dev values (`colors.js` in github.com/reactjs/react.dev). The base
  is React's dark neutral grays, NOT a saturated fill. Surfaces are defined by elevation + crisp
  solid borders, and the brand hues are **accents, not backgrounds**: ground `#16181D` (page +
  inset wells, gray-95) → raised `#23272F` (cards, gray-90) → overlay `#343A46` (hover/nested/
  elevated, gray-80). Insets (code interiors, in-card inputs) cut back to `bg-ground`. Borders are
  **solid, never alpha-faded**: structural chrome uses `border-slate-syntax` (`#404756`, gray-70,
  full strength — never text); interactive outlines (outline buttons, inputs, toggles) use
  `border-gray-outline` (`#99A1B3`, gray-30 — ≥3:1 non-text on every surface, chrome never copy),
  stepping to `border-gray-body` on hover / `border-accent` when active.
  One carve-out: on the light `bg-slate-50` demo panels (dark-mode demos), `text-slate-syntax`
  IS the correct copy color (~9:1 there; gray-body would be ~1.7:1) — don't "fix" those call sites.
  Accent `#61DAFB` (classic React cyan) = links/focus/CTA/active — **text-grade** (10.93:1 on ground).
  Brand `#087EA4` (react.dev teal, `--color-brand`) = **large decorative fills only** — 3.83:1 on
  ground fails AA for text/small UI. Body/ink `#F6F7F9` (gray-5), muted `#BCC1CD` (gray-20).
- Colors + fonts live as CSS variables in `app/globals.css` (`@theme`). Components reference the
  resulting Tailwind tokens (`bg-ground`, `bg-ground-raised`, `bg-ground-overlay`, `text-accent`,
  `text-fg`, `text-gray-body`, `border-*`) — **never** a raw hex or arbitrary value.
- Wordmark: `hookli.` (lowercase, cyan full stop) beside the hook mark (inline SVG from
  `public/hookli-icon.svg`). Assets in `public/` (`hookli-banner.svg/.png`, `hookli-icon.svg`).
- **Plus Jakarta Sans** for headings + body; monospace ONLY inside code surfaces (code block,
  install command, API value/type cells, demo inputs). Inline SVG icons — never emoji as icons.

## Conventions

Modeled on the Nzmly frontend convention (see `~/Developer/platform/frontend/storefront-v2/CLAUDE.md`).
Decisive rules — **one convention per topic, no alternatives.** Each shows the right way and the wrong way.

### 1 — File & folder names are kebab-case (lowercase-first), always

Every file and folder under `app/`, `components/`, and `lib/` is **kebab-case** — components included.
The *export* inside is PascalCase (components) or camelCase (functions/data); the **file name never is**.
This is the single rule the previous pass got backwards — do not "fix" files to PascalCase.

```
✅ components/hook-page.tsx        (exports function HookPage)
✅ components/code-block.tsx       (exports function CodeBlock, CopyButton)
✅ components/demos/use-toggle-demo.tsx   lib/hooks-registry.ts   lib/web-apis.tsx
❌ components/HookPage.tsx   components/CodeBlock.tsx   components/demos/UseToggleDemo.tsx
```

App Router files keep their framework names (`page.tsx`, `layout.tsx`, `not-found.tsx`,
`opengraph-image.tsx`, `sitemap.ts`, `robots.ts`); route folders are kebab-case (`app/docs/[slug]`).

### 2 — Folders group by role, then by feature; barrel with index.ts

- `app/` — routes and route-level files ONLY (page/layout/metadata/OG/sitemap/robots). No shared UI here.
- `components/` — shared components, flat by default. When one concern grows several files, give it a
  kebab-case subfolder (as `components/demos/` does) with an `index.ts` barrel re-exporting the public parts.
- `components/demos/` — one demo module per hook (`use-<name>-demo.tsx`) + shared primitives (`ui.tsx`).
- `lib/` — framework-agnostic modules: data/registry (`hooks-registry.ts`, `hook-docs.ts`, `hook-sources.ts`),
  utilities (`web-apis.tsx`, `shiki.ts`), constants. Prefer a folder + `index.ts` when a concern spans files.

```
✅ lib/hooks-registry.ts (data)   components/sidebar.tsx (UI)   app/docs/[slug]/page.tsx (route)
❌ app/components/sidebar.tsx      lib/Sidebar.tsx               components/site-config.ts placed in app/
```

### 3 — Component file anatomy

- **Named exports only — never `export default`** (except the App Router files Next requires, e.g. `page.tsx`).
- **Server by default.** Add `"use client"` as the *first line* only when the file needs state, effects,
  event handlers, or browser APIs. Keep client components as leaves (demos, widgets, palette).
- **Props:** inline type for 1–2 props; a named `type <Name>Props` above the component otherwise.
- One primary component per file (named to match the file's kebab slug); private helpers live below it.

```tsx
✅  "use client";                          ❌  export default function Card(p: any) { … }
    import { useState } from "react";      ❌  // interactivity with no "use client"
    type CounterProps = { start: number };
    export function Counter({ start }: CounterProps) { … }
```

### 4 — Data / registry organization (single source of truth)

- `lib/hooks-registry.ts` (`HOOKS` + helpers) is the ONLY hook list. Sidebar, pages, search, and counts
  all derive from it — never redeclare the list or hardcode a count.
- Per-hook page content in `lib/hook-docs.ts`; vendored implementation snapshots in `lib/hook-sources.ts`
  (kept in sync with the installed `hookli` version).
- **Live hooks import from the published `hookli` package** — never a relative path or the sibling repo.

```ts
✅ import { useToggle } from "hookli";     ✅ const count = HOOKS.length;
❌ import { useToggle } from "../../rehooks-app/src";   ❌ const count = 11;
```

### 5 — Import order (one block; blank line only after the directive)

1. `"use client"` (first line, blank line after). 2. Framework (`next/*`, `react`) then third-party
(`hookli`, `shiki`). 3. Internal `@/` alias — `@/components/*` then `@/lib/*`. 4. Relative (`./*`).

### 6 — Styling & tokens

Style with Tailwind utilities bound to the `@theme` tokens (`bg-ground`, `bg-ground-raised`, `text-accent`,
`text-fg`, `text-gray-body`, `border-*`, `font-sans`, `font-mono`). **Never** a hardcoded hex, an arbitrary
color (`text-[#61dafb]`), or an inline `style` color — add a token to `globals.css` first, then reference it.

### 7 — Accessibility

Decorative SVGs get `aria-hidden="true"`; interactive elements keep a visible keyboard focus ring;
icon-only controls need an `aria-label`; respect `prefers-reduced-motion`.

## Quality gate (before every commit)
```bash
bash ralph/check.sh   # npm run lint + npx tsc --noEmit + npm run build
```

## Ralph loop
This app is built by the Ralph loop: backlog in `ralph/prd.json`, durable log in
`ralph/progress.txt`, operating manual in `ralph/prompt.md`, design source of truth in
`docs/DESIGN.md`. One task per iteration, gate green before commit, no pushes/deploys/publishes.
