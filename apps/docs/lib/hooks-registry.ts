/* The hook list is the LIBRARY manifest — the single source of truth
   (`packages/hookli/hooks.manifest.json`, imported via the `hookli/manifest` subpath
   export). Adding a hook in the library makes it appear here automatically; nothing is
   hand-maintained. This file keeps the docs-side types, category order/labels and helpers. */
import manifest from "hookli/manifest";

export type HookCategory = "state" | "effects" | "dom" | "data";

export type HookEntry = {
  slug: string;
  name: string;
  description: string;
  category: HookCategory;
  signature: string;
};

export const HOOKS: readonly HookEntry[] = (manifest as { hooks: readonly HookEntry[] }).hooks;

/* Sidebar / docs-index group order (docs/DESIGN.md §6). */
export const CATEGORY_ORDER: readonly HookCategory[] = [
  "state",
  "effects",
  "dom",
  "data",
] as const;

export const CATEGORY_LABELS: Record<HookCategory, string> = {
  state: "State",
  effects: "Effects",
  dom: "DOM",
  data: "Data",
};

export function getHook(slug: string): HookEntry | undefined {
  return HOOKS.find((hook) => hook.slug === slug);
}

export function hooksByCategory(category: HookCategory): HookEntry[] {
  return HOOKS.filter((hook) => hook.category === category);
}

/* Sibling hooks to surface at the bottom of a hook page: same category first,
   topped up in registry order so every page always shows `limit` suggestions. */
export function relatedHooks(slug: string, limit = 3): HookEntry[] {
  const current = getHook(slug);
  if (!current) return [];
  const sameCategory = HOOKS.filter(
    (hook) => hook.category === current.category && hook.slug !== slug,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const fill = HOOKS.filter(
    (hook) => hook.slug !== slug && !sameCategory.includes(hook),
  );
  return [...sameCategory, ...fill].slice(0, limit);
}
