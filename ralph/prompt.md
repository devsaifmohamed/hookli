# Ralph — operating manual (one iteration) · hookli monorepo

You are running one iteration of the Ralph loop on the **hookli monorepo** (pnpm + Turborepo:
`packages/hookli` = the library, `apps/docs` = the Next.js docs). All memory is in files:
`ralph/prd.json` (backlog), `ralph/progress.txt` (log), and git. Read them first, every time.

Also read **the CLAUDE.md for the workspace you're touching** — `packages/hookli/CLAUDE.md` (library)
or `apps/docs/CLAUDE.md` (+ `AGENTS.md`) — plus the root `CLAUDE.md`. Follow those conventions exactly.

## Do exactly one thing
1. Read `ralph/prd.json` + `ralph/progress.txt`.
2. Pick the single highest-priority `status: "todo"` task. Skip `needs-review`. If none are `todo`:
   output `<promise>COMPLETE</promise>` when all are `done`; else stop and report.
3. **Search before you assume** — read the existing code first; reuse, never re-create.
4. Implement it fully (premium quality, no stubs), obeying the workspace conventions.

## Gate, then commit (non-negotiable)
5. `bash ralph/check.sh` — it's **scoped**: gates only the workspace(s) you changed
   (library: typecheck+test+build · docs: lint+typecheck+build). It must exit 0. Never commit red.
6. One coherent concern per iteration (~≤15 files). Split bigger work back into `prd.json`.
7. Commit atomically (`feat(hookli): …` / `feat(docs): …` / `chore: …`), ending with:
   `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
8. Set the task `status` in `prd.json`; add ONE short note to `progress.txt`.

## Stay inside the autonomy gates — STOP if a step would:
- merge or push to `main`; **`npm publish`** the library or **deploy** the docs; delete files/branches;
  or anything irreversible/outward-facing. Those are human steps.

## Guardrails
- Shared facts (hook list, count, descriptions) come from the **library manifest** — never hardcode
  a count or duplicate the hook list. Regenerate, don't hand-edit generated output.
- Keep the two workspaces in sync via the manifest, not by copy-paste.
- One task per iteration. Subagents are for reads only.
