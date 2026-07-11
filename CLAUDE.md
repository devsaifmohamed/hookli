# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

**`hookio`** (brand: **hook.io**) — a published npm library of commonly-used React hooks,
written in TypeScript and bundled with **tsup** (CJS + ESM + `.d.ts`). No app, no
framework — a pure hooks package consumed by other React/Next.js projects.

- Package name: `hookio` (the merged spelling of the brand **hook.io** — npm disallows dots
  in names). Renamed 2026-07-11 from the old `@saif.dev/use-any-hook`.
- Entry: `src/index.ts` → `export * from "./hooks"`.
- Docs site: https://use-any-hook-d92674ab.mintlify.app (still under the OLD slug — rebrand separately).
- Peer deps: `react` / `react-dom` `^18.2.0`. Runtime deps: none.

## Commands

```bash
yarn install          # deps (yarn 1.x classic; a yarn.lock is committed)
yarn build            # tsup → dist/ (index.js CJS, index.mjs ESM, index.d.ts types)
npx tsc --noEmit      # typecheck only (no test suite exists yet)
bash ralph/check.sh   # the quality gate: tsc --noEmit + tsup build must both pass
```

There is **no test runner, linter, or CI** configured yet. The quality net today is
`tsc --noEmit` + a successful `tsup` build — that is exactly what `ralph/check.sh`
enforces. If you add hooks, keep that gate green.

## Layout

```
src/
  index.ts              # public entrypoint — re-exports everything in ./hooks
  types.ts              # shared type helpers (e.g. CustomHook<T>)
  hooks/
    index.ts            # barrel — every hook MUST be re-exported here
    use<Name>.hook.ts   # one hook per file
```

## Conventions (follow these when adding or editing a hook)

1. **One hook per file**: `src/hooks/use<Name>.hook.ts`, named export `use<Name>`.
2. **Register the export**: add the file to `src/hooks/index.ts`. A hook that isn't
   re-exported there ships to nobody — this is the most common miss.
3. **Type the public API explicitly.** Prefer a named `interface`/`type` for the return
   shape over inferred anonymous objects. Generics (`<T>`) where the hook is data-shaped
   (`useFetch<T>`, `useLocalStorage<T>`).
4. **SSR-safety is mandatory.** Consumers render on the server (Next.js). Never touch
   `window` / `document` / `navigator` / `localStorage` at module scope or during the
   initial render without a `typeof window !== "undefined"` guard. Browser access belongs
   inside `useEffect` (which only runs client-side) or behind a guard.
5. **Clean up every subscription.** `addEventListener` / `setTimeout` / observers must be
   removed in the effect's cleanup return.
6. **Document it** in `README.md` (there's a per-hook list + a commented usage section).

### Known issues worth knowing (from the initial scan)
- `useDarkMode` persists the **stale** theme value (writes `localStorage` from the
  pre-toggle `isDarkMode`) — see `ralph/prd.json` T1.
- `useLocalStorageWithExpiry` reads the raw `{value, expiry}` wrapper instead of the inner
  value, and doesn't update React state on expiry — T2.
- Several hooks read browser globals during initial render — T3.

These are seeded as tasks in `ralph/prd.json`; don't silently "fix" them outside that flow
unless asked.

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
