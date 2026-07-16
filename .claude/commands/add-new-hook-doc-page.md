---
name: add-new-hook-doc-page
description: Workflow command scaffold for add-new-hook-doc-page in hookli.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-hook-doc-page

Use this workflow when working on **add-new-hook-doc-page** in `hookli`.

## Goal

Adds documentation for a new React hook, including interactive demo, registry entry, docs metadata, and vendored source snapshot.

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

- Create demo component in components/demos/{hook-name}-demo.tsx
- Add hook entry to lib/hook-docs.ts
- Add hook source to lib/hook-sources.ts
- Add hook to lib/hooks-registry.ts
- Update ralph/prd.json to mark the task done

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.