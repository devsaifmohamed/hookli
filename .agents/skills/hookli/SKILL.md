```markdown
# hookli Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill covers the development patterns, coding conventions, and collaborative workflows for the **hookli** repository—a TypeScript codebase built with Next.js. The project focuses on documenting and demoing custom React hooks, maintaining a design system, and tracking progress with structured documentation and logs. It emphasizes consistent code style, clear commit messages, and streamlined processes for adding features, updating documentation, and enforcing conventions.

---

## Coding Conventions

### File Naming

- **Kebab-case** is used for all files, especially in `components/`.
  - Example: `use-interval-demo.tsx`, `my-component.tsx`

### Import Style

- **Alias imports** are preferred, using configured path aliases.
  - Example:
    ```typescript
    import { useInterval } from '@/lib/hooks/use-interval';
    import Demo from '@/components/demos/use-interval-demo';
    ```

### Export Style

- **Mixed exports**: Both default and named exports are used as appropriate.
  - Example:
    ```typescript
    // Named export
    export function useInterval(callback: () => void, delay: number) { ... }

    // Default export
    export default DemoComponent;
    ```

### Commit Messages

- **Conventional commits**: Use prefixes like `feat`, `chore`, `design`.
  - Example: `feat: add useTimeout hook and demo page`
- **Average commit message length**: ~78 characters.

---

## Workflows

### Add New Hook Doc Page

**Trigger:** When someone wants to document a new hook for the site.  
**Command:** `/add-hook-doc`

1. Create a demo component:  
   `components/demos/{hook-name}-demo.tsx`
2. Add a hook entry to:  
   `lib/hook-docs.ts`
3. Add the hook's source snapshot to:  
   `lib/hook-sources.ts`
4. Register the hook in:  
   `lib/hooks-registry.ts`
5. Mark the task as done in:  
   `ralph/prd.json`
6. Update the progress log:  
   `ralph/progress.txt`

**Example:**
```typescript
// components/demos/use-interval-demo.tsx
import { useInterval } from '@/lib/hooks/use-interval';

export default function UseIntervalDemo() {
  // Demo implementation here
}
```

---

### Batch Add Multiple Hook Doc Pages

**Trigger:** When documenting a group of new hooks together.  
**Command:** `/batch-add-hook-docs`

1. For each hook:
   - Create demo in `components/demos/{hook-name}-demo.tsx`
   - Add entry to `lib/hook-docs.ts`
   - Add source to `lib/hook-sources.ts`
   - Register in `lib/hooks-registry.ts`
2. Mark all related tasks as done in `ralph/prd.json`
3. Update `ralph/progress.txt`

---

### Feature Development with PRD Tracking

**Trigger:** When implementing a new feature or completing a tracked task.  
**Command:** `/complete-task`

1. Implement the feature in `app/`, `components/`, or `lib/` as needed.
2. Mark the task as done in `ralph/prd.json`.
3. Log progress in `ralph/progress.txt`.

---

### Design System Token Update

**Trigger:** When updating design tokens (colors, typography, etc.) or visual style.  
**Command:** `/update-design-tokens`

1. Edit `app/globals.css` to update tokens.
2. Update `docs/DESIGN.md` and/or `AGENTS.md` to reflect changes.
3. Optionally update assets in `public/` (e.g., branding SVGs or PNGs).

---

### Component File Naming Convention Enforcement

**Trigger:** When enforcing or migrating to kebab-case for component files.  
**Command:** `/enforce-kebab-case-components`

1. Rename all `components/*.tsx` files to kebab-case.
2. Update all imports in `app/`, `components/`, and related files to match new names.
3. Update `AGENTS.md` and/or conventions documentation.

---

### Ralph Progress Logging

**Trigger:** Whenever a tracked task or batch is completed.  
**Command:** `/log-progress`

1. Edit `ralph/progress.txt` to log the latest progress.

---

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test files:** Named with `.test.ts` suffix.
  - Example: `use-interval.test.ts`
- **Typical test structure:**
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { useInterval } from '@/lib/hooks/use-interval';

  describe('useInterval', () => {
    it('calls callback at specified interval', () => {
      // Test implementation
    });
  });
  ```

---

## Commands

| Command                       | Purpose                                                        |
|-------------------------------|----------------------------------------------------------------|
| /add-hook-doc                 | Add documentation and demo for a new hook                      |
| /batch-add-hook-docs          | Add documentation and demos for multiple hooks in one batch    |
| /complete-task                | Complete a feature/task and update PRD/progress                |
| /update-design-tokens         | Update design tokens and sync design documentation             |
| /enforce-kebab-case-components| Enforce kebab-case naming for component files and update imports|
| /log-progress                 | Log progress after completing a task or batch                  |
```
