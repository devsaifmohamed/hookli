# CLAUDE.md — hookli monorepo

Guidance for Claude Code (claude.ai/code) at the **root** of the hookli monorepo. Each
workspace has its own `CLAUDE.md` with the rules for that workspace — read the one for the
code you're touching. This file covers the whole repo.

## What this is

A **pnpm + Turborepo monorepo** for **hookli** — a zero-dependency, typed React hooks library
and its docs site. One repo, two workspaces, one source of truth.

| Workspace | Path | What | Ships to |
|---|---|---|---|
| **Library** | `packages/hookli/` | the `hookli` npm package (folder-per-hook, tsup CJS+ESM+`.d.ts`, vitest) | **npm** |
| **Docs** | `apps/docs/` | Next.js App Router docs + landing; imports the library via `workspace:*` | **Vercel** (`hookli.vercel.app`) |
| *(brand)* | `packages/brand/` | *(planned)* shared tokens / tagline / URLs / banner | — |

The docs consume the **local** library through the workspace symlink — no npm round-trip while
developing; a change to a hook is visible in the docs immediately.

## Commands (run from the root)

```bash
pnpm install                 # install all workspaces (pnpm 11)
pnpm dev                     # turbo: run every workspace's dev
pnpm build                   # turbo: build library + docs (docs waits for the library)
pnpm test                    # turbo: vitest across workspaces
pnpm typecheck               # turbo: tsc --noEmit across workspaces
pnpm lint                    # turbo: eslint across workspaces
bash ralph/check.sh          # the gate — scoped to the workspace(s) that changed

# target one workspace
pnpm --filter hookli run build
pnpm --filter hookli-docs run dev
```

> **pnpm 11 note:** `verifyDepsBeforeRun: false` is set in `pnpm-workspace.yaml` — esbuild/sharp
> ship prebuilt binaries via optional deps, so their postinstall scripts aren't needed and the
> pre-run deps-check must not hard-fail. Don't re-enable it.

## Layout

```
hookli/                       # repo root (github.com/saifmohamedsv/hookli)
├── CLAUDE.md                 # ← you are here (whole-repo)
├── .claude/                  # git-safety hooks, settings, commands, agents
├── ralph/                    # the gated self-driving loop (scoped gate)
├── packages/hookli/          # the library    → packages/hookli/CLAUDE.md
├── apps/docs/                # the docs site   → apps/docs/CLAUDE.md (+ AGENTS.md)
├── pnpm-workspace.yaml  turbo.json  package.json  .npmrc
└── LICENSE  CONTRIBUTING.md  SECURITY.md  CODE_OF_CONDUCT.md
```

## Conventions

Each workspace owns its conventions — **read the workspace `CLAUDE.md` before editing there:**
- **`packages/hookli/CLAUDE.md`** — one hook per `src/hooks/use-<name>/` folder (hook + vitest test
  + `meta` + barrel), typed public API, SSR-safe, tsup build.
- **`apps/docs/CLAUDE.md`** (+ `AGENTS.md`) — kebab-case files, Geist UI font (JetBrains Mono for code
  only), token-only styling, a11y.

Never let the two drift: shared facts (hook list, count, descriptions, version) come from the
**library manifest**, not hand-maintained copies. See `packages/hookli/CLAUDE.md`.

## Releasing (human-gated — do NOT automate)

Publishing is the one irreversible action. **Never** `npm publish` / `npm version` / push a tag
on your own. Release the library from its workspace:

```bash
pnpm --filter hookli run build          # (prepublishOnly also runs tsup)
cd packages/hookli && npm publish --otp=<code>
```

## Deploying the docs (human-gated)

Vercel builds `apps/docs` (project **Root Directory = `apps/docs`**) against the workspace library.
A push to `main` deploys. Don't push/deploy from an agent loop.

## Ralph — the gated self-driving loop

`ralph/` runs one task per iteration and must pass `ralph/check.sh` — which is **scoped**: it gates
only the workspace(s) whose files changed (library: typecheck+test+build · docs: lint+typecheck+build).
It stops at the autonomy gates: no merge/push to `main`, no deletions, no publish/deploy.

```bash
bash ralph/ralph-once.sh          # one supervised iteration
bash ralph/afk-ralph.sh 10        # up to 10 autonomous iterations
RALPH_MODEL=sonnet bash ralph/afk-ralph.sh 10   # override the model (default: opus)
```

## Safety hooks (`.claude/`)

- `hooks/guard-destructive-git.cjs` — wired in `settings.json`; pauses on destructive git
  (force-push, branch/remote deletion, push to `main`).
- `hooks/enforce-pr-body.cjs` — available; wire it in `settings.json` if you adopt a PR template.
