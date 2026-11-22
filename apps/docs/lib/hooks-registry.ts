/* The hook list is the LIBRARY manifest (`hookli/manifest`) and the categories are the
   library's catalog/categories.json. Adding a hook or a category in the library makes it
   appear here; nothing is hand-maintained. Both are small, so client code may import this. */
import manifest from "hookli/manifest";
import categories from "../../../packages/hookli/catalog/categories.json";

const CATEGORY_IDS = ["state", "effects", "dom", "data"] as const;
export type HookCategory = (typeof CATEGORY_IDS)[number];

export type CategoryInfo = { id: HookCategory; label: string; title: string; description: string };

/* The docs key icons and featured hooks by category id, so the ids must match the library's. */
if (categories.map((c) => c.id).join() !== CATEGORY_IDS.join()) {
  throw new Error(`hooks-registry: catalog/categories.json ids (${categories.map((c) => c.id)}) differ from HookCategory (${CATEGORY_IDS})`);
}

/* In catalog/categories.json order (docs/DESIGN.md §6). */
export const CATEGORIES = categories as CategoryInfo[];

export type HookEntry = {
  slug: string;
  name: string;
  description: string;
  category: HookCategory;
  signature: string;
};

export const HOOKS: readonly HookEntry[] = (manifest as { hooks: readonly HookEntry[] }).hooks;

export const CATEGORY_ORDER: readonly HookCategory[] = CATEGORIES.map((c) => c.id);

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<HookCategory, string>;

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
