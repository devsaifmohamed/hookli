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

- `packages/hookli/src/hooks/{hook-name}/{hook-name}.ts` (its TSDoc is the page content)
- `apps/docs/components/demos/{hook-name}-demo.tsx`
- `apps/docs/components/demos/index.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Start the hook with `pnpm new:hook {hook-name}` (writes the hook, test, demo and map lines)
- Replace every TODO in the hook's TSDoc and write the demo

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.