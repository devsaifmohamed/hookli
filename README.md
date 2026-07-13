# hookli-docs

The documentation + landing site for **[hookli](https://www.npmjs.com/package/hookli)** —
a small, typed, SSR-safe React hooks library by
[@saifmohamedsv](https://github.com/saifmohamedsv/hookli).

Every one of the library's 11 hooks gets its own page with a **live, interactive demo
that imports from the published `hookli` npm package** — the site is running proof the
library works, not just prose about it. Benchmark: [usehooks-ts.com](https://usehooks-ts.com).

```bash
npm i hookli
```

## Stack

- **Next.js 16** (App Router, React 19) — statically generated
- **TypeScript** (strict)
- **Tailwind CSS v4** — theme tokens live in `app/globals.css` under `@theme`, no config file
- **shiki** — build-time syntax highlighting (server/build only)
- **next/font** — Plus Jakarta Sans (UI) + JetBrains Mono (code), self-hosted via `@fontsource/*`
- No runtime UI dependencies beyond React; demos import hooks from **`hookli`** on npm.

## Getting started

```bash
npm install
npm run dev      # dev server → http://localhost:3000
npm run build    # production build (static export of all routes)
npm run start    # serve the production build
npm run lint     # eslint
```

### Quality gate

One script runs the full gate — **lint + typecheck + production build**. It must exit 0
before any commit:

```bash
bash ralph/check.sh
```

## Sitemap

| Route | What it is |
|---|---|
| `/` | Landing: hero → feature grid → live `useToggle` proof → hooks index → support teaser → CTA |
| `/docs` | Docs index: intro, install, quick example, hook cards grouped by category |
| `/docs/[slug]` | One page per hook (11, statically generated) — demo, usage, API, source, prev/next |
| `/support` | Sponsor / star / contribute cards (payment links are placeholders) |
| `*` (not found) | Branded 404 |

## Project structure

```
app/                     Routes & route-level files ONLY (no shared UI)
  page.tsx               Landing
  docs/layout.tsx        Sidebar shell for all docs pages
  docs/page.tsx          Docs index
  docs/[slug]/page.tsx   Thin routing wrapper → renders <HookPage> from registry data
  support/page.tsx       Support placeholder
  layout.tsx             Root metadata, fonts, Header + Footer
  opengraph-image.tsx    Brand OG image (next/og)
  docs/[slug]/opengraph-image.tsx  Per-hook OG card
  apple-icon.tsx  sitemap.ts  robots.ts  not-found.tsx  globals.css

components/               Shared UI, flat by default (kebab-case files, PascalCase exports)
  hook-page.tsx          THE data-driven template every hook page renders through
  hook-demo.tsx  code-block.tsx  api-table.tsx  on-this-page.tsx
  header.tsx  footer.tsx  sidebar.tsx  wordmark.tsx  icons.tsx  search-palette.tsx
  ...landing sections (features-section, live-proof-section, hooks-index-section, ...)
  demos/                 One demo module per hook + shared demo primitives (ui.tsx)

lib/                      Framework-agnostic data & utilities
  hooks-registry.ts      SINGLE SOURCE OF TRUTH — the hook list (sidebar/pages/search/sitemap derive from it)
  hook-docs.ts           Per-hook page content (demo import, usage snippet, parameters, returns, types)
  hook-sources.ts        Vendored implementation snapshots (kept in sync with the installed hookli version)
  web-apis.tsx           term → MDN link chips for hook descriptions
  shiki.ts  og.tsx  site.ts

docs/DESIGN.md           Design source of truth (brand tokens, IA, page anatomy)
ralph/                   Ralph build-loop backlog, progress log, gate script, operating manual
```

## Adding a new hook page

Because everything is data-driven, a new hook needs **no new layout code** — only data
and one demo component:

1. **Registry** — add an entry to `HOOKS` in `lib/hooks-registry.ts`
   (`slug`, `name`, `description`, `category`, `signature`). Sidebar, search, sitemap,
   OG images, `generateStaticParams`, and the "N hooks" landing count all pick it up.
2. **Page content** — add a matching entry to `HOOK_DOCS` in `lib/hook-docs.ts`
   (the demo component, usage snippet, `parameters`, `returns`, and any `types`).
   A slug with no entry falls back to a signature-only page automatically.
3. **Demo** — create `components/demos/use-<name>-demo.tsx` (`"use client"`), importing the
   hook from **`hookli`**. Gate any `window`/`localStorage`/`document` access behind a
   `mounted` flag so `next build` prerender stays green. Reuse the primitives in
   `components/demos/ui.tsx`.
4. **Source snapshot** — add the hook's implementation to `lib/hook-sources.ts` (kept in
   sync with the installed `hookli` version) so the page's **Hook** section shows real code.

`app/docs/[slug]/page.tsx` and `components/hook-page.tsx` need no changes.

## Conventions & brand

Engineering conventions (kebab-case files, named exports, token-only styling, import order,
barrels) are documented in [`AGENTS.md`](./AGENTS.md). The visual system (brand v3: dark-first
Prussian/Scooter palette, tonal depth scale, typography) lives in
[`docs/DESIGN.md`](./docs/DESIGN.md) and is implemented purely through the `@theme` tokens in
`app/globals.css` — components reference tokens (`bg-ground`, `text-accent`), never raw hex.

## How this site was built

hookli-docs was built by the **Ralph loop** — an autonomous, one-task-per-iteration build
loop. The backlog is `ralph/prd.json`, the durable log is `ralph/progress.txt`, and the
operating manual is `ralph/prompt.md`. Every iteration ends only after `ralph/check.sh` is
green.
