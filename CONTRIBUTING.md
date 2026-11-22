# Contributing to hookli

Thanks for helping improve **hookli** — a small, zero-dependency library of typed,
SSR-safe React hooks. Contributions of any size are welcome.

## Getting started

```bash
git clone https://github.com/saifmohamedsv/hookli.git
cd hookli
pnpm install
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

```bash
pnpm new:hook use-<name>
```

The starter writes everything a hook needs, and the build fails until each `TODO` in it is replaced:

- `src/hooks/use-<name>/use-<name>.ts` (the hook, with a TSDoc template), `use-<name>.test.ts`
  (with its server-render case) and `index.ts`, plus the line in `src/hooks/index.ts`
- `apps/docs/components/demos/use-<name>-demo.tsx` (a working demo) and its line in
  `apps/docs/components/demos/index.ts`

Then:

1. **Write the hook.** Type the public API with a named `interface`/`type`; use generics where
   it's data-shaped.
2. **Stay SSR-safe** — never touch `window` / `document` / `navigator` / `localStorage` during
   render or at module scope; only inside `useEffect`, or behind `typeof window !== "undefined"`.
   The test's `expectSSRSafe` case checks it.
3. **Clean up** every `addEventListener` / `setTimeout` / observer in the effect's cleanup return.
4. **Replace every TODO in the TSDoc** (format below) and make the demo show the hook.
5. **Add a search case** for the hook to `packages/hookli-mcp/test/search-cases.ts`.

That's all. The README index, the docs page, `llms.txt`, `hookli/manifest` and the MCP
server all read the hook's TSDoc; there is no other copy to update. Run `pnpm readme` to
refresh the README index (CI checks it).

## TSDoc format

Each hook's TSDoc is its documentation. The build reads it with the TypeScript compiler and
fails with `use-x: <field>: <problem>` when something is missing.

```ts
/**
 * Delays updating a value until it has stopped changing for `delay` ms.   ← summary (one sentence)
 *
 * The timer restarts on every change and is cleared on unmount, so no      ← details (optional)
 * update lands after the component is gone. SSR-safe.
 *
 * @category effects                                ← one of catalog/categories.json
 * @keywords debounce, wait until typing stops, delay value
 * @param delay - In milliseconds. Defaults to `500`.
 * @returns value - The last value that held still for `delay` ms.
 *
 * @example Usage                                   ← the first @example is the usage
 * ```tsx
 * import { useDebounce } from "hookli";
 *
 * export function Search() {
 *   const [text, setText] = useState("");
 *   const query = useDebounce(text, 300);
 *   …
 * }
 * ```
 */
```

- **Parameters, return values and types come from the code.** Write a `@param` or `@returns`,
  or a comment on an interface member, only when it says something the name and type don't:
  behaviour, defaults (`Defaults to …`), units, SSR, edge cases. An obvious one is left out.
  One exception: a hook returning a plain value (not an object, tuple or `void`) needs one
  `@returns name - text`, because that row is its only Returns entry. The strict build checks it.
- Label tuple members in the type (`[value: boolean, toggle: () => void]`), or name them with
  `@returns [0] value - …`.
- Every `@example` is compiled against the library (`pnpm --filter hookli run examples:check`).
- A deprecated alias is `/** @deprecated Use useX. */ export const useOld = useX;`.

Full conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Quality gate (must be green before a PR merges)

```bash
npx tsc --noEmit   # 1. typecheck
pnpm test          # 2. vitest - all hooks have colocated tests
pnpm build         # 3. the strict catalog build, then tsup: CJS + ESM + .d.ts must all emit
```

Or run all three for every workspace from the root: `pnpm typecheck && pnpm test && pnpm build`. **CI runs these on every pull request, plus lint (`pnpm lint`), the README check (`pnpm readme`), `examples:check`, the library and MCP package tests (`test:package`) and the StackBlitz playground check.** None of it needs secrets, so it passes on a fork.

## Commit & PR

- Keep changes focused; one concern per PR.
- Conventional commits are appreciated (`feat: …`, `fix: …`, `docs: …`).
- Fill in the PR template so reviewers have context.

## Releases

Publishing is maintainer-gated — please don't bump the version or publish in a PR.
