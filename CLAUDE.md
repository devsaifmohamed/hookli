# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

**`hookli`** — a published npm library of commonly-used React hooks,
written in TypeScript and bundled with **tsup** (CJS + ESM + `.d.ts`). No app, no
framework — a pure hooks package consumed by other React/Next.js projects.

- Package name: `hookli`. Renamed 2026-07-11 from the old `@saif.dev/use-any-hook`
  (via short-lived `re-hooks`/`hookio` attempts — `hookio` was blocked by npm as too
  similar to the existing `hook.io`).
- Entry: `src/index.ts` → `export * from "./hooks"`.
- Docs site: https://use-any-hook-d92674ab.mintlify.app (still under the OLD slug — rebrand separately).
- Peer deps: `react` / `react-dom` `^18.2.0`. Runtime deps: none.

## Commands

```bash
yarn install          # deps (yarn 1.x classic; a yarn.lock is committed)
yarn build            # tsup → dist/ (index.js CJS, index.mjs ESM, index.d.ts types)
yarn test             # vitest — colocated per-hook tests
npx tsc --noEmit      # typecheck only
bash ralph/check.sh   # quality gate: tsc --noEmit + vitest + tsup build
```

Tests run on **vitest** (colocated `*.test.ts` per hook) and **CI** runs the gate on every push/PR. The quality net is
`tsc --noEmit` + `vitest` tests + a successful `tsup` build — that is exactly what `ralph/check.sh`
enforces. If you add hooks, keep that gate green.

## Layout

Per-hook folders (usehooks-ts style), all kebab-case:

```
src/
  index.ts                       # public entrypoint — re-exports ./hooks
  types.ts                       # shared type helpers (e.g. CustomHook<T>)
  hooks/
    index.ts                     # barrel — re-exports every hook folder
    use-toggle/
      index.ts                   # folder barrel — export * from "./use-toggle"
      use-toggle.ts              # the hook (camelCase export `useToggle`)
      use-toggle.test.ts         # vitest test, colocated
    use-local-storage/ …         # one folder per hook
```

## Conventions

Decisive rules — **one convention per topic, no alternatives.** Each shows the right way and
the wrong way. (Documentation style borrowed from the Nzmly frontend `CLAUDE.md`.)

### 1 — One folder per hook, kebab-case

Each hook is a kebab-case **folder** under `src/hooks/` (usehooks-ts style, unified 2026-07-13)
containing three files: the hook, its colocated test, and a folder barrel. Only file/folder
names are kebab — the **export stays camelCase** `use<Name>`.

```
✅ src/hooks/use-toggle/use-toggle.ts        (export const useToggle = …)
✅ src/hooks/use-toggle/use-toggle.test.ts   src/hooks/use-toggle/index.ts
❌ src/hooks/use-toggle.hook.ts   src/hooks/useToggle/useToggle.ts   src/hooks/Toggle/…
```

### 2 — Register every hook in the barrel

Add each new file to `src/hooks/index.ts` (which `src/index.ts` re-exports). A hook that isn't
re-exported ships to nobody — the most common miss.

```ts
✅ export * from "./use-toggle";      ❌ // file added but not exported from the barrel
```

### 3 — Type the public API explicitly

Prefer a named `interface`/`type` for the return shape over an inferred anonymous object.
Use generics where the hook is data-shaped (`useFetch<T>`, `useLocalStorage<T>`).

```ts
✅ interface UseFetchResponse<T> { data: T | null; error: Error | null; loading: boolean }
❌ export const useFetch = (url) => ({ data, error, loading })  // untyped, no generic
```

### 4 — SSR-safety is mandatory

Consumers render on the server (Next.js). Never touch `window` / `document` / `navigator` /
`localStorage` at module scope or during the initial render without a guard. Browser access
belongs inside `useEffect` (client-only) or behind `typeof window !== "undefined"`.

```ts
✅ const [v] = useState(() => typeof window === "undefined" ? init : read());
❌ const [v] = useState(() => localStorage.getItem(key));   // crashes on the server
```

### 5 — Clean up every subscription

`addEventListener` / `setTimeout` / observers must be removed in the effect's cleanup return.

### 6 — Document it in `README.md`

Add the hook to the "Available hooks" list with a one-line description. Public API changes go in
the README (and, once it exists, the docs site's `hook-docs` entry in `../hookli-docs`).

### Build & typecheck stay green

`bash ralph/check.sh` (`tsc --noEmit` + `vitest` + `tsup`) must pass before any commit.

## Releasing (human-gated — do NOT automate)

Publishing is the one irreversible, outward-facing action here. **Never** run
`npm publish` / `yarn publish`, `npm version`, or push a git tag on your own — the version
history (`1.3.x` commits) shows the maintainer drives releases by hand. Ship code and let
a human cut the release.

## Ralph — the gated self-driving loop

`ralph/` holds a stateless, file-memory task loop (see `ralph/README.md` + `ralph/GUIDE.md`).
All memory lives in `ralph/prd.json` (backlog), `ralph/progress.txt` (log), and git.

```bash
bash ralph/ralph-once.sh          # one supervised iteration — start here
bash ralph/afk-ralph.sh 10        # up to 10 autonomous iterations, stops when backlog drains
bash ralph/approve.sh <task-id>   # commit a review-first task the loop left in the tree
bash ralph/check.sh               # the gate the loop must pass before every commit
```

The loop does **exactly one task per iteration**, must pass `ralph/check.sh` before
committing, and **stops** at the autonomy gates: no merge/push to `main`, no deletions, and
**no publish/version/tag**. The backlog (`ralph/prd.json`) is currently seeded with the
quality-pass tasks T1–T4 above.

## Safety hooks (`.claude/`)

- `hooks/guard-destructive-git.cjs` — wired in `settings.json`; pauses for confirmation on
  destructive git (force-push, branch/remote deletion, push to `main`). Best-effort backstop.
- `hooks/enforce-pr-body.cjs` — copied in but **not wired** (it expects a
  `.github/pull_request_template.md`). Enable it in `settings.json` if you adopt that template.
