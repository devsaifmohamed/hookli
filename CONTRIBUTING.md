# Contributing to hookli

Thanks for helping improve **hookli** — a small, zero-dependency library of typed,
SSR-safe React hooks. Contributions of any size are welcome.

## Getting started

```bash
git clone https://github.com/saifmohamedsv/hookli.git
cd hookli
yarn install
```

## Repository structure

Each hook lives in its **own kebab-case folder** under `src/hooks/` (usehooks-ts style),
with the hook, its colocated test, and a barrel:

```
src/
  index.ts                         # re-exports src/hooks
  hooks/
    index.ts                       # barrel — re-exports every hook folder
    use-toggle/
      index.ts                     # export * from "./use-toggle"
      use-toggle.ts                # the hook   (export const useToggle = …)
      use-toggle.test.ts           # vitest test, colocated
    use-local-storage/ …           # one folder per hook
```

Only file/folder names are kebab-case; the **export name stays camelCase** (`useToggle`).

## Adding a new hook

1. **Create the folder** `src/hooks/use-<name>/` with three files:
   - `use-<name>.ts` — the hook. Named export `use<Name>`; type the public API with a named
     `interface`/`type`; use generics where it's data-shaped.
   - `use-<name>.test.ts` — a vitest test (see any existing hook for the pattern; use
     `renderHook`/`act` from `@testing-library/react`).
   - `index.ts` — `export * from "./use-<name>";`
2. **Register it** in `src/hooks/index.ts`: `export * from "./use-<name>";` (a hook that isn't
   re-exported ships to nobody).
3. **Stay SSR-safe** — never touch `window` / `document` / `navigator` / `localStorage` during
   render or at module scope; only inside `useEffect`, or behind `typeof window !== "undefined"`.
4. **Clean up** every `addEventListener` / `setTimeout` / observer in the effect's cleanup return.
5. **Document it** in `README.md` under "Available hooks".

Full conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Quality gate (must be green before a PR merges)

```bash
npx tsc --noEmit   # 1. typecheck
yarn test          # 2. vitest — all hooks have colocated tests
yarn build         # 3. tsup: CJS + ESM + .d.ts must all emit
```

Or run all three at once: `bash ralph/check.sh`. **CI runs the same gate on every pull request.**

## Commit & PR

- Keep changes focused; one concern per PR.
- Conventional commits are appreciated (`feat: …`, `fix: …`, `docs: …`).
- Fill in the PR template so reviewers have context.

## Releases

Publishing is maintainer-gated — please don't bump the version or publish in a PR.
