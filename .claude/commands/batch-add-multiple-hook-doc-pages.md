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

- `components/demos/{hook-name}-demo.tsx`
- `lib/hook-docs.ts`
- `lib/hook-sources.ts`
- `lib/hooks-registry.ts`
- `ralph/prd.json`
- `ralph/progress.txt`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- For each hook: create demo component in components/demos/{hook-name}-demo.tsx
- For each hook: add entry to lib/hook-docs.ts
- For each hook: add source to lib/hook-sources.ts
- For each hook: add to lib/hooks-registry.ts
- Update ralph/prd.json to mark all related tasks done

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.