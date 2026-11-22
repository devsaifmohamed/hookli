---
name: batch-add-multiple-hook-doc-pages
description: Workflow command scaffold for batch-add-multiple-hook-doc-pages in hookli.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /batch-add-multiple-hook-doc-pages

Use this workflow when working on **batch-add-multiple-hook-doc-pages** in `hookli`.

## Goal

Adds documentation for several new hooks in a single commit, following the same steps as adding a single hook doc page, but for multiple hooks at once.

## Common Files

- `packages/hookli/src/hooks/{hook-name}/{hook-name}.ts` (its TSDoc is the page content)
- `apps/docs/components/demos/{hook-name}-demo.tsx`
- `apps/docs/components/demos/index.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- For each hook: `pnpm new:hook {hook-name}` (writes the hook, test, demo and map lines)
- For each hook: replace every TODO in its TSDoc and write the demo

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.