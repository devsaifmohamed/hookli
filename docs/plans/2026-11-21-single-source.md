# RFC: One source of truth per hook

Status: **Locked** by the CEO on 2026-11-21, with **amendment 1** (same day, after PR 1 measured the repo; see the end of this doc). The business half and every open question were approved; the plan was reviewed by the product owner, three tech-lead lenses and two re-reviews, with every finding folded in (see "Review log").
Codex: skipped for this plan, at the CEO's request.
Diagrams: [today](assets/2026-11-21-hookli-architecture-today.png) and [target](assets/2026-11-21-hookli-single-source-target.png).

## Problem

Each fact about a hook's API is hand-written in several places. Nothing checks that the copies agree.

| Fact | Hand-written in today | Copies |
|---|---|---|
| Description | `hooks.manifest.json`; JSDoc in `use-x.ts` | 2 |
| Signature and types | the code; the manifest `signature` string; types in `apps/docs/lib/hook-docs.ts` | 3 |
| Parameter, return and type-field text | JSDoc `@param` / field comments; `hook-docs.ts` tables | 2 |
| Usage and examples | `hook-docs.ts` | 1 |
| Category (and the category list) | the manifest; order and labels in `gen-readme.mjs` and `hooks-registry.ts` | 3 |
| Keywords | the manifest | 1 |

On top of that, 3 scripts write generated files that are committed and must be refreshed by hand, or CI fails: the README (mirrored to the repo root), `apps/docs/lib/hook-sources.generated.ts`, and `packages/hookli-mcp/src/data/catalog.json` + `meta.json`.

Measured on `main` (e7a7a44):

- **66 of 66** manifest descriptions differ from the hook's own JSDoc. 11 hooks have no JSDoc on the export. No check fails.
- Docs types drift from the code. `useHover`'s docs say `RefObject<T> | T | null`, but the code says `RefObject<T | null> | T | null`. `DebounceOptions.leading` has different text in the code and the docs.
- `hook-docs.ts` is 3,650 lines. That is 6× the next biggest hand-written file, and it only feeds docs and MCP.
- History shows the cost:
  - `useDraggable` (3c1e009) shipped to npm with no docs entry.
  - The `useDefault` → `useDefaultValue` rename (30ddfaf) touched 14 files, and the old docs URL broke.
  - The #14 type change was made in 3 places, plus 2 regenerated files and a generator bug fix.

## Goal

A contributor writes a hook's facts once, in the hook's own folder. The npm package, README, docs site and MCP server all get them from there. A mistake makes CI fail with a message that names the hook and the field.

Success is a **cleanliness score** measured before and after (target 90 or more), plus **scenario and mistake tests** that stay in the repo. Before shipping, we also check that the npm types are identical once comments are stripped and every other output difference is approved.

## Scenarios

What a contributor does in the target state, and what must be true after. The "ideal edits" are frozen here and feed metric M2.

| # | Scenario | Ideal hand edits (frozen) | Must be true after |
|---|---|---|---|
| S1 | **Add a hook** | 7: `use-x.ts`, `use-x.test.ts` (including its SSR case), `use-x/index.ts`, barrel line in `src/hooks/index.ts`, `use-x-demo.tsx`, one line in the demo map, one MCP search tuning case | `useX` is in npm, `hookli/manifest`, the README index and count, `/docs/use-x` with its demo, `llms.txt`, and MCP `list_hooks` / `search_hooks` |
| S2 | **Add a hook, forget something** | — | CI fails with `use-x: <field>: <problem>` (mistakes X1–X7, X10) |
| S3 | **Bug fix, no API change** | 2: code + test | The Source section, StackBlitz and MCP `get_hook_source` show the new code. No generated file in the diff |
| S4 | **Public API change** (param type, new optional param, new return field) | 2: code (with its TSDoc) + test | Manifest signature, docs tables and MCP update. A stale or missing `@param` fails CI (X6, X7) |
| S5 | **Docs text only** (summary, example, keywords) | 1 | Docs page, README line and MCP search update |
| S6 | **Rename with deprecated alias** | 7: the 3 renamed folder files, barrel, the demo file renamed, the demo map line, the search tuning case | The old name is still importable and marked deprecated, with no catalog entry or page of its own. The old URL redirects. Hooks that import the old folder are updated, or CI fails |
| S7 | **Move to another category** | 1 (a new category: 2, adding `catalog/categories.json`) | README grouping, docs sidebar and MCP filter follow. A category left empty fails CI (X13) |
| S8 | **Delete a hook** | 8: 3 folder files, barrel, demo, demo map line, the search tuning case, `catalog/removed-hooks.json` | Gone from README, count, docs nav, `llms.txt` and MCP. `/docs/use-x` shows "Removed in vX, use Y". MCP `get_hook` gives the same answer. A hook that still imports it fails CI with the dependent's name (X12) |
| S9 | **Forget to run a generator** | — | Nothing to run. Outputs are built, never committed (the README is checked in CI) |
| S10 | **Two sources disagree** | — | Impossible by construction (one copy). The leftover checks are X6–X8 |
| S11 | **Release** | — | The `hookli` tarball contains a manifest built from the same commit; a package test fails if it's missing. The `hookli-mcp` catalog records the `hookli` version it was built from |
| S12 | **Outside user of `hookli/manifest`** | — | Same shape and fields. Description values change (decided). The change is noted in `CHANGELOG.md` |
| S13 | **Clean checkout, one workspace** (Vercel docs build, MCP-only CI, `pnpm dev`, `typecheck`) | — | Works with no manual script. turbo builds the library first, including on a cache hit |
| S14 | **Example goes stale** | — | Every `@example` is type-checked against the current library. A broken one fails CI (X8) |
| S15 | **First-time contributor from a fork** | — | Following only `CONTRIBUTING.md` gets a green fork build, with no secrets needed |

### Frozen mistake list (metric M3)

Each mistake must make the CI command fail with a message naming the hook. It is run against both layouts.

| # | Mistake | From history |
|---|---|---|
| X1 | Hook folder not exported from the barrel | `packages/hookli/CLAUDE.md` calls it "the most common miss" |
| X2 | No summary (JSDoc) | 11 hooks today |
| X3 | Missing or unknown category | |
| X4 | No keywords | |
| X5 | No usage example | |
| X6 | `@param` names a parameter that doesn't exist | |
| X7 | A parameter with no `@param` | |
| X8 | An `@example` that doesn't compile against the current API | |
| X9 | A demo for a hook that doesn't exist | |
| X10 | A hook with no demo | `useDraggable` (3c1e009) |
| X11 | `removed-hooks.json` lists a hook that still exists | |
| X12 | Deleting a hook another hook imports | 10 hooks import siblings |
| X13 | A category with no hooks | |
| X14 | Docs show a parameter type that differs from the code | #14, `useHover` today |
| X15 | Manifest description differs from the hook's JSDoc | 66/66 today |

## Cleanliness score

A number from 0 to 100. **It's a measurement for this project, not code in the repo (CEO):** a score script kept outside the repo measures it once before (done: 40.6) and once after.

| # | Metric | How it's measured | Ideal | Weight |
|---|---|---|---|---|
| M1 | Copies per fact | Hand-written places for the 6 facts in the Problem table, summed. The category list counts, so the floor is 7: `@category` plus `catalog/categories.json` | 7 | 25 |
| M2 | Hand edits per scenario | For S1 and S3–S8: ideal ÷ actual edits, averaged. Before: replayed once on `main`. After: counted by the scenario tests. Each test also runs every "one edit left out" variant, and each variant must fail, so the count can't be padded or trimmed | the frozen table above | 25 |
| M3 | Mistakes caught | Share of X1–X15 that make the CI command set fail. The score script applies each mistake fixture and runs that set (`pnpm test`, `examples:check`, the docs demo check). X14 and X15 count as caught only when M1 shows a single copy of that fact, so the bug can't exist | 100% | 25 |
| M4 | Committed generated files | Tracked files a generator writes. The README and its root mirror are one output | 1 | 15 |
| M5 | Generator scripts | Scripts that write data the shipped outputs read (README, manifest, catalog, docs or MCP data). The fixed list lives in the score script; banner rendering, the score script, the codemod and check scripts aren't counted | 1 | 10 |

Each metric scores `ideal ÷ actual`, capped at 1, times its weight; M3 uses the percentage directly. Today's rough numbers (M1 7/12, M4 1/4, M5 1/3, M3 low) put the score near **40**. PR 1 measures the real one. **Target: 90 or more.**

## How we prove it before shipping

1. **Score:** the out-of-repo score script, run on `main` (before) and on the release branch (after). Both scorecards go in the release PR description.
2. **Scenarios and mistakes:** tests of the generator, run against fixture hook folders in a temp dir. They cover S1–S8 end states and X1–X15. They **stay in the repo**, so every future PR is protected too. The "before" replay of the same scenarios lives only on the release branch.
3. **Parity:**
   - The npm `.js`/`.mjs` must be byte-identical to `main`, and the `.d.ts` identical once comments are stripped. The TSDoc that 3a–3g add is meant to show up in `.d.ts` hovers. `.map` files are excluded, because they embed the source.
   - Every difference in the manifest, MCP catalog, hook markdown, `llms.txt` and README must appear in an approved-diff list: reworded descriptions, docs types corrected to the code's, signature formatting.
   - The MCP search eval floors (95% / 90% top-3) must still pass.
4. **Gate:** ship only with a score of 90 or more, every scenario and mistake test green, and parity clean or approved.

## Non-goals

- No change to any hook's behavior or public API (JS byte-identical; `.d.ts` identical once comments are stripped).
- No docs UI redesign, no new demos, no moving hooks between categories.
- No docs URL changes other than the S6 redirects and the S8 "Removed in vX" page, which the CEO approved as a small new feature.
- No change to the MCP tools beyond the data they read, plus the alias and removed answers.
- No npm release in this work. Releasing stays a human step.

## Decisions taken

- **Description:** the JSDoc wording wins. The manifest one-liners are dropped. The 11 hooks with no JSDoc get one written. The first sentence becomes the one-line summary for the README, docs cards and MCP search. (CEO)
- **Deleted hooks:** the old URL shows a "Removed in vX" page naming the replacement. Until a release ships it, the page shows "Removed (next release)". (CEO, version rule from the review)
- **Score:** weights as written, target 90 or more. (CEO)
- **Codemod PRs:** split by category within the 15-file cap. (CEO) The counts (state 19, effects 16, dom 23, data 8) make it **7 PRs**, 3a–3g. The question said 6, which was a miscount.
- **Row text:** where docs table text and code TSDoc differ (parameter, return and type-field text), the docs table text wins and moves into the TSDoc. (CEO)
- **Types:** the code's type wins over a simplified or stale docs type. Every changed type is listed in the approved diffs. (CEO)

---

# Draft 2: technical design

## 1. The hook file is the source

Everything about a hook lives in `packages/hookli/src/hooks/use-x/use-x.ts`, as TSDoc on the exported hook and on the types it uses. Many hooks already do half of this: 47 have `@param`, and option types such as `DebounceOptions` already document each field.

```ts
/**
 * Tracks whether the pointer is currently hovering the referenced element.    ← summary (first sentence)
 *
 * Listens for `mouseenter` / `mouseleave` … (more detail)                     ← details
 *
 * @category dom
 * @keywords hover, mouse enter, mouse leave, is hovered, hover state
 * @param elementRef - A ref to the element, or the element itself (`null` until mounted).
 * @returns isHovered - `true` while the pointer is over the element.
 *
 * @example Usage
 * ```tsx
 * import { useRef } from "react";
 * import { useHover } from "hookli";
 * …
 * ```
 * @example Element mounted by a child component
 * Use `useState` and `ref={setEl}` when a child mounts the element.
 * ```tsx
 * …
 * ```
 */
```

### Extraction rules

The generator uses the TypeScript compiler API with the type checker: `ts.createProgram` on `src/index.ts`, about 1–2 s for 66 files. Walking the real exports of `src/index.ts` gives the public API, finds `@deprecated` aliases, resolves types from sibling hooks, and catches a folder missing from the barrel (X1). Signatures are kept as **source text** (normalised whitespace), never re-printed by TypeScript, so they read like the code.

| Field | Rule |
|---|---|
| `slug`, `name` | Folder name; export name. `kebab(name)` must equal the folder (`useClickAnyWhere` → `use-click-any-where` holds) |
| `summary`, `details` | First sentence of the TSDoc; the rest |
| `category`, `keywords` | `@category` (must be in `catalog/categories.json`); `@keywords` (comma list) |
| `signature` | Source text of the declaration. **Overloads** (`useEventListener` has 4): one line per overload, implementation excluded. TSDoc is read from the first overload. `export { x }` at the end of the file is supported |
| `parameters[]` | Names and defaults from the code. Types from the code (the code wins over today's simplified docs types, listed in the approved diffs). Text from `@param` |
| `returns[]` | One row per `@returns` tag, in order. A tag is `@returns name - text` or `@returns [0] value - text` for tuple members. Each row's type comes from the checker (the tuple element, the property, or the whole return type). So `useToggle` (`[0]`/`[1]`/`[2]`), `useDebounceValue` (aliased tuple), `useBoolean` (5 rows) and `useQueue` (one row plus an alias table) are all expressible with no `.d.ts` change |
| `typeAliases[]` | Types reached from the signature and the return type, followed transitively, **exported or not** (`GeolocationState` is local), in first-seen order. Rows:<br>• object and interface members (nested objects get dotted names, e.g. `coords.latitude`)<br>• a call signature becomes a `(...args)` row<br>• a union becomes one `value` row listing its members (`TernaryDarkMode`)<br>• each member's text comes from its own TSDoc, and `Defaults to …` gives `defaultValue`<br>The alias name keeps its generics (`DebouncedState<Args, R>`) |
| `usage`, `examples[]` | First `@example` is the usage; the rest are examples (title on the tag line, optional text, one code block) |
| `source`, `sourcePath`, `deps` | File text; path; sibling hooks imported (as `gen-hook-sources.mjs` does today) |
| `aliases[]` | `@deprecated` re-exports in the folder's `index.ts` (for example `useDefault`) |

## 2. Files and data shapes

Hand-written inputs live together in `packages/hookli/catalog/`. Outputs are built and git-ignored.

### `packages/hookli/generated/catalog.json` (built)

Why: one record per hook with every fact. The docs and MCP read it, and the manifest is the public projection of it.

```json
{
  "slug": "use-hover", "name": "useHover",
  "summary": "Tracks whether the pointer is currently hovering the referenced element.",
  "details": "Listens for `mouseenter` / `mouseleave` on the element …",
  "category": "dom",
  "keywords": ["hover", "mouse enter", "mouse leave", "is hovered", "hover state"],
  "signature": "useHover<T extends HTMLElement = HTMLElement>(elementRef: RefObject<T | null> | T | null): boolean",
  "parameters": [{ "name": "elementRef", "type": "RefObject<T | null> | T | null", "defaultValue": null, "description": "A ref to the element, or the element itself (`null` until mounted)." }],
  "returns": [{ "name": "isHovered", "type": "boolean", "description": "`true` while the pointer is over the element." }],
  "typeAliases": [], "usage": "import { useRef } from \"react\"; …",
  "examples": [{ "title": "Element mounted by a child component", "description": "Use `useState` and `ref={setEl}` …", "code": "…" }],
  "aliases": [], "source": "…", "sourcePath": "packages/hookli/src/hooks/use-hover/use-hover.ts", "deps": ["use-event-listener"]
}
```

The file also holds `{ "libraryVersion": "1.7.0", "removed": [...], "categories": [...] }` alongside `hooks`.

### `packages/hookli/hooks.manifest.json` (built, shipped in npm)

The public `hookli/manifest` export (S12). Same shape as today: `slug`, `name`, `description` (= `summary`), `category`, `signature`, `keywords`. For overloaded hooks, the signature is the overloads joined with `\n`.

### `packages/hookli/catalog/categories.json` (hand-written)

```json
[{ "id": "state", "label": "State" }, { "id": "effects", "label": "Effects" }, { "id": "dom", "label": "DOM" }, { "id": "data", "label": "Data" }]
```

It replaces the order and label lists in `gen-readme.mjs` and `hooks-registry.ts`.

### `packages/hookli/catalog/removed-hooks.json` (hand-written, starts as `[]`)

```json
[{ "slug": "use-x", "name": "useX", "removedIn": null, "replacement": "use-y", "note": "Merged into useY." }]
```

`removedIn: null` shows "Removed (next release)". The release step fills in the version.

### Relations

```
use-x.ts (1) ──► catalog hook (1) ──► manifest entry (1), README line (1), /docs/use-x (1), MCP entry (1)
demos/index.ts map entry (1) ──► /docs/use-x demo             exactly one per hook (X9, X10)
aliases (0..N) of a hook ──► redirect /docs/<alias-slug> → /docs/use-x
categories.json (1) ──< catalog hook (N)                      one category per hook, no empty category
removed-hooks.json entry (1) ──► "Removed" page + MCP get_hook answer; never also a live hook (X11)
```

## 3. One generator: `packages/hookli/scripts/build-catalog.mjs`

- **Final state (PR 7):** `build` = `node scripts/build-catalog.mjs && tsup`. It writes `generated/catalog.json` and `hooks.manifest.json` only, so the build has no side effects outside the package.
- **Until every hook is migrated (PRs 2–3g):** the generator runs only as a standalone script and in its fixture tests. It writes `generated/catalog.json` only, never the still-committed manifest. It reports missing fields as a list instead of failing.
- **PR 4 makes it strict and wires it into `build`.** The manifest switches over in PR 7.
- `build-catalog.mjs --readme` writes the README index and count, and its root mirror. It runs in CI's check step (README committed and stale-checked, the only generated file left) and in `prepublishOnly`.
- **Validation:** it fails with `use-x: <field>: <problem>` for X1–X7, X11 and X13. X8 is covered by `examples:check`, X9 and X10 by the docs demo check, and X12 by `tsc` plus a generator message naming the dependent hook.
- The `@example` blocks are extracted to temp `.tsx` files and type-checked against the library (`pnpm --filter hookli examples:check`, part of the library verify).
- It replaces `gen-readme.mjs`, `scripts/gen-hook-sources.mjs` and `scripts/build-mcp-catalog.mjs`. The last one runs `hook-docs.ts` text in a `vm` sandbox, which is not a security boundary; parsing runs nothing.

### Build wiring (fixes a clean checkout and a turbo cache hit)

- `turbo.json`: the library's build `outputs` add `generated/**` and `hooks.manifest.json`, so a cache hit restores them. `dev` gets `dependsOn: ["^build"]`.
- `packages/hookli-mcp/package.json`: add `"hookli": "workspace:*"` as a devDependency, so `^build` orders the library first. The MCP `test` depends on its own `build`.
- `packages/hookli/package.json`: `prepublishOnly` runs `pnpm run build` (not bare `tsup`), plus a new `test:package` that packs the tarball and fails if `hooks.manifest.json` is missing.
- `apps/docs/vercel.json` pins `turbo run build --filter=hookli-docs`. Vercel already builds the library today, because `dist` isn't committed. The real risk was the cache, fixed above.
- A missing catalog fails with "Run `pnpm --filter hookli build`" from a small loader in each consumer, not a bundler "Module not found".

## 4. Consumers

- **Library:** `generated/` and `hooks.manifest.json` are git-ignored. `files` and `exports` are unchanged.
- **Docs (`apps/docs`).** The full catalog is imported through a tsconfig path alias, `@hookli/catalog` → `../../packages/hookli/generated/catalog.json` (Vercel already includes files outside the Root Directory for the workspace).
  - **Server-only:** it is read only by server modules (`lib/hook-catalog.ts`, guarded by `import "server-only"`).
  - **Client bundle:** `hooks-registry.ts`, which client components such as `sidebar.tsx` and `search-palette.tsx` import, keeps reading the slim `hookli/manifest`. So the roughly 300 KB catalog, with every hook's source, never ships to the browser.
  - **Deleted:** `lib/hook-docs.ts`, `lib/hook-sources.generated.ts`. `types/hookli-manifest.d.ts` stays, because client code still imports `hookli/manifest`.
  - **Switched to the catalog:**
    - `lib/hook-sources.ts`, `lib/hook-markdown.ts`, `lib/llms.ts`, `lib/stackblitz.ts` (`lib/hooks-registry.ts` keeps the manifest, plus the labels from `categories.json`)
    - `components/hook-page.tsx`, `components/hook-demo.tsx`
    - `scripts/check-playgrounds.mts`
  - **Demos:** they keep their named `<Name>DocDemo` exports (AGENTS.md forbids `export default`). One explicit map, `components/demos/index.ts` (`Record<slug, ComponentType>`), replaces the 66 imports in `hook-docs.ts`. The map isn't a copy of a hook fact. `generateStaticParams` and `check-playgrounds` fail when its keys don't match the catalog slugs (X9, X10).
  - **Markdown:** TSDoc `details` render through the markdown renderer with raw HTML off. `dangerouslySetInnerHTML` stays limited to shiki output.
  - **Routing:** `next.config.ts` adds redirects from alias slugs. `/docs/[slug]` renders the "Removed" page for slugs in `removed`.
- **MCP (`packages/hookli-mcp`).**
  - Imports the library's `generated/catalog.json` directly. tsup bundles it, so there is no copy and no `src/data/`.
  - `tsconfig.json`'s `rootDir: "src"` is widened, or removed, so `tsc` accepts the import (TS6059). The `catalog-freshness` test goes, and a test that the bundle matches the catalog's `libraryVersion` replaces it.
  - **Ownership:** `meta.json` is replaced by values computed in `catalog.ts` (`libraryVersion` from the catalog, `mcpVersion` from its own `package.json`, `hookCount`). `docsUrl` is derived from the slug in `catalog.ts`.
  - **Public type unchanged:** `HookCatalogItem` is exported, and `list_hooks` returns `description`. The field keeps its name `description` and holds the summary, so there's no public API change. Search weights are as today.
  - **Lookups:** `get_hook` / `search_hooks` match aliases. The not-found path answers "removed in vX, use Y" for removed hooks.
- **Docs, rules and agent files updated:**
  - `CONTRIBUTING.md` (new "add a hook" steps), both `CLAUDE.md` files, `apps/docs/README.md` and `AGENTS.md`
  - `.claude/commands/add-new-hook-doc-page.md`, `.claude/commands/batch-add-multiple-hook-doc-pages.md`, `.claude/skills/hookli/SKILL.md`, the `.claude/settings.json` reminder
  - `CHANGELOG.md` notes the reworded manifest descriptions
- **CI:** the generated-files step shrinks to the README check. `examples:check` and the library `test:package` are added.

## 5. Measurement and tests

- **Kept in the repo (they protect the future):**
  - `packages/hookli/scripts/build-catalog.test.ts`: vitest fixture tests. One per mistake X1–X7, X11–X13, and one per scenario's library end state S1–S8 (catalog, manifest, README), run on temp copies of fixture hook folders. Each scenario also runs its "one edit left out" variants, and each must fail. Library edits are covered here; the demo-file and demo-map variants of S1, S6 and S8 are covered by the docs demo check, and the MCP variants by the MCP tests.
  - **MCP end states** (S1, S6, S8: `list_hooks`, alias lookup, removed answer): MCP tests against a fixture catalog.
  - **Docs end states** (page exists, redirect, removed page, demo map): `check-playgrounds` and the docs build.
  - `examples:check` (X8).
  - The docs demo check (X9, X10).
- **Outside the repo (CEO):** the score script and the "before" replay. M1, M4 and M5 are static: a declared fact table, checked against `git ls-files` and the scripts that write outputs. M2 and M3 come from the replay (before) and from the tests above (after).
- **Release branch only (deleted before merge):**
  - The parity test from 3a (catalog vs `hook-docs.ts` + manifest, field by field) and `parity-approved.json`. They leave `main` in PR 6. The release-branch copy and a snapshot of `main`'s outputs stay until the release PR's parity report is made.
- **Release PR body:** both scorecards; the parity report (JS byte-identical, `.d.ts` identical once comments are stripped, approved diffs listed, search eval floors green).

## 6. Impacted surface (CEO to confirm)

| Area | What changes | Blast radius |
|---|---|---|
| library | TSDoc on 66 hooks; `build-catalog.mjs` + tests; `catalog/`; manifest built; `prepublishOnly` and `test:package`; `examples:check` | **High:** the public `hookli/manifest` (same shape, reworded descriptions); the npm tarball contents |
| docs | 2 files deleted; 8 switched to the catalog; demo map; redirects and removed page; path alias; `vercel.json` | **High:** public URLs and every hook page |
| mcp | Imports the library catalog; `meta.json`/`docsUrl` computed; alias and removed answers; `rootDir` widened | **High:** answers AI agents rely on; search ranking |
| hookli (cross-cutting) | `turbo.json`, CI, CONTRIBUTING, CLAUDE.md files, `.claude` commands/skill/settings | Medium: build order and cache for every workspace |

## 7. Delivery plan (task lane)

Release branch `release/single-source`. Build PRs carry at most 15 production files each.

| PR | Slice | Depends on |
|---|---|---|
| 1 | ~~Score + before replay~~ **Done outside the repo** (#19 closed unmerged, CEO): before scorecard 40.6 / 100 | — |
| 2 | `build-catalog.mjs` (with the type checker) as a standalone script: writes `generated/catalog.json` only, lists missing fields without failing; fixture tests; `examples:check` | — (sibling of 1) |
| 3a–3g | Codemod `hook-docs.ts` → TSDoc, one category slice per PR (state 3a–3b, effects 3c–3d, dom 3e–3f, data 3g, all ≤15 files); JSDoc for the 11 missing; `catalog/categories.json` in 3a. 3a adds the parity test (catalog vs `hook-docs.ts` + manifest, migrated hooks only) and `parity-approved.json`; each PR extends both. Until PRs 5 and 6, each also regenerates and commits `hookli-mcp/src/data/catalog.json` and `docs/lib/hook-sources.generated.ts` (they embed hook source, and CI checks them). Those count against the 15-file cap | 2, stacked in order |
| 4 | Generator strict (X1–X7, X11, X13 fail), wired into the library `build` (catalog only); turbo outputs (`generated/**`); hookli-mcp devDependency on `hookli` and MCP `test` after its `build`; `dev` after `^build` | 3g |
| 5 | MCP imports the catalog; `rootDir` widened; meta, `docsUrl`, aliases, removed answer; delete `build-mcp-catalog.mjs` **and its CI line**, plus the MCP `prebuild` and `gen:catalog` scripts that call it | 4 |
| 6 | Docs read the catalog (server-only) and keep the manifest in client code; demo map; delete `hook-docs.ts`, `hook-sources.generated.ts`, `gen-hook-sources.mjs` **and its CI line**; delete the parity test | 5 (needs `build-mcp-catalog.mjs` gone, since it reads `hook-docs.ts`) |
| 7 | Manifest built and git-ignored (turbo output `hooks.manifest.json`); `--readme`; delete `gen-readme.mjs`; CI README check; `prepublishOnly` + `test:package`; `vercel.json`; CONTRIBUTING, CLAUDE.md, `.claude` files, CHANGELOG | 6 |
| 8 | `catalog/removed-hooks.json` + "Removed" page + alias redirects | 7 |
| — | **After scorecard** + parity report (JS byte-identical, `.d.ts` identical once comments are stripped, approved diffs, search eval) in the release PR | all |

Every PR builds and passes CI on its own: any script a PR deletes, it also removes from CI, and nothing reads the generator's strict output before PR 4.

Tests ship with the code in library and MCP PRs. Docs PRs rely on the demo check, `check-playgrounds` and the build.

## 8. Deployment Steps

- **Env vars / migrations:** none.
- **Vercel:** `apps/docs/vercel.json` pins the build command (PR 7). Check that the previews of PR 6 and PR 7 build from a cold cache, since those are the first PRs where the docs read generated files.
- **npm:** nothing in this work. The next human release of `hookli` runs the new `prepublishOnly`, so `test:package` proves `hooks.manifest.json` is in the tarball. The manifest descriptions change, so the `CHANGELOG` notes it.
- **Rollback:** Vercel Instant Rollback first, then revert the release merge. If a release already shipped: `npm deprecate` it and publish a patch, never unpublish.

## 9. Risks

- **MCP search ranking.** The summary changes (weight 1.5), the keywords don't (weight 3). The eval floors run in parity. If one drops, fix the keywords, not the floors.
- **Docs types change to the code's.** Some docs types were simplified or out of date by hand. Showing the code's types is more accurate, but some pages get longer types. Every case is listed in the approved diffs.
- **Codemod mistakes.** The parity test (from 3a) compares every field for all 66 hooks before anything switches over.
- **turbo or Vercel cache.** Covered by the outputs fix and a cold-cache preview check.

## 10. Open questions

None. All answered by the CEO on 2026-11-21 (see "Decisions taken").

## Review log

| Reviewer | Finding | Resolution |
|---|---|---|
| Product owner | M2 ideal not defined; M3 list gameable | Frozen ideal-edits table and X1–X15 list |
| Product owner | Stale examples; sibling imports; forks; category registry; versions; CHANGELOG; non-goals | S14, S15, X12, X13; `categories.json` counted in M1; "Removed (next release)"; CHANGELOG note; non-goals widened |
| Tech lead, production | turbo cache drops generated files; MCP not ordered after the library; tarball can miss the manifest | §3 build wiring: outputs, devDependency, `prepublishOnly` + `test:package` |
| Tech lead, production | Stale copy in MCP; meta and `docsUrl` with no owner; docs import path; build writing the README; error messages; rollback; HTML in TSDoc | MCP imports the catalog directly; computed in `catalog.ts`; path alias; `--readme` step; loader message; Vercel rollback; markdown without HTML |
| Tech lead, simplicity | Harness bigger than the system | Probes dropped. Scenario and mistake checks are durable fixture tests; the before replay and parity live only on the release branch; `score.mjs` is small and static |
| Tech lead, simplicity | Syntax-only parsing would need hand-written module resolution; demos by file name | Type checker program on `src/index.ts`; an explicit demo map with named exports |
| Tech lead, correctness | Returns, type aliases, overloads, docs types, text conflicts, missing consumers, `meta.json`, clean-checkout order, slug rule | §1 rules (multi-`@returns`, transitive local types, unions, call signatures, overloads); §4 full consumer list; CEO decisions on row text and types; S13; kebab rule |
| Re-review (all lenses) | PR 2 can't pass CI before the codemod; PRs 4 and 5 can't be siblings | §7 reordered: standalone generator until 3g, strict + wired in PR 4, MCP before docs, every deleted script also leaves CI |
| Re-review (all lenses) | M1 ideal unreachable; M2 tautological; docs and MCP end states outside vitest; X14/X15 untestable; M5 ambiguous | M1 ideal 7; "one edit left out" variants must fail; MCP fixture tests + docs checks; X14/X15 rule; a fixed M5 list |
| Re-review (all lenses) | Full catalog in the client bundle; MCP `rootDir`; `description` rename is a public API change | Catalog server-only, manifest in client code; `rootDir` widened; field name kept |
| Second re-review | `.d.ts` can't stay byte-identical once TSDoc is added; MCP `prebuild`; manifest types file; 3a–3g must regenerate the committed files; stale PR numbers; owner of each "one edit left out" variant | JS byte-identical, `.d.ts` compared with comments stripped; PR 5 drops `prebuild`/`gen:catalog`; types file kept; 3a–3g regenerate and count those files; sections aligned (parity from 3a, `vercel.json` in PR 7, cold-cache check on PRs 6–7, M1 7/12); variant owners named |

## Amendment 1 (2026-11-21, after PR 1 #19 and PR 2 #18)

The measured before score is **40.6 / 100**: M1 10.9, M2 9.2, M3 13.3 (8 of 15 caught), M4 3.8, M5 3.3. Measuring the real repo found these gaps in the locked plan:

| Finding | Change to the plan | PR |
|---|---|---|
| Category is hand-written in **7** places, not 3. The 4 extra: `apps/docs/app/docs/page.tsx` (`CATEGORY_META`), `components/sidebar.tsx` (`CATEGORY_ICONS`), MCP `src/types.ts` (`HookCategory`), MCP `tools/index.ts` (`z.enum`) | `catalog/categories.json` gains `title` and `description` (from `CATEGORY_META`). The MCP `HookCategory` type and `z.enum` are built from it. The docs icon map and the featured-hooks map stay as docs UI, keyed by category id; a check fails if their keys don't match `categories.json`, or if a featured hook doesn't exist | 5, 6 |
| `export { x as y }` with `@deprecated` loses the tag in the bundled `.d.ts`, so `useDefault` isn't marked deprecated in the published types today | Alias rule: `/** @deprecated Use useX. */ export const useOld = useX;`. `useDefault` is converted in its state PR. The `.d.ts` text changes (approved diff, and a bug fix) | 3a–3b, §1 |
| Tests force per-hook edits the ideals missed: `ssr.test.ts` `ARGS` list; MCP search tuning case per hook | **CEO:** each hook's SSR case moves into its own `use-x.test.ts` (shared `expectSSRSafe()` helper), and the central `ARGS` list is deleted in 3g. The search tuning case stays on purpose. Ideals: S1 6→7, S6 6→7, S8 7→8 | 3a–3g, 5 |
| Hook counts are hard-coded: `dual-install-widget.tsx`, `hero-agent-preview.tsx` ("66 hooks"), the MCP README | Docs read `HOOKS.length`. The MCP README drops the exact number | 5, 6 |
| `useEventListener` has 4 overloads: whose parameter types go in the table? | **CEO:** the union of the public overloads (approved diff) | 2 |
| From PR 2: `useIsomorphicLayoutEffect` isn't a function declaration | Annotate it `: typeof useLayoutEffect`, matching today's `.d.ts` | 3c–3d |
| From PR 2: destructured parameters (`useCountdown`, `useIntersectionObserver`) | Name taken from the `@param` in the same position | 2 (done) |
| From PR 2: signatures keep source defaults (`initialValue: boolean = false` vs today's `initialValue?: boolean`) | Approved diff | 3a–3g |
| From PR 2: union and tuple aliases | The alias takes the first sentence of its TSDoc, and the `value` row takes the rest | 2 (done), codemod |
| From PR 2: all 45 existing `@returns` tags are free text | The codemod rewrites each as `name - text` or `[0] name - text` | 3a–3g |
| From PR 2: `useExpandableText`'s only `@example` doesn't compile | Replaced by the docs usage in its dom PR | 3e–3f |
| From PR 1: the before replay couldn't run the `react-18` CI job (needs network) | Accepted; that job reruns the library tests on React 18 and isn't part of M3 | — |
| CEO on #19: the score is for us, not for the repo | #19 closed unmerged. The score and replay scripts live outside the repo and are run once more at the end for the after score. The durable scenario and mistake tests next to the generator stay, because they are real tests of the generator | 1 |
