import removed from "../../../packages/hookli/catalog/removed-hooks.json";

/* Hooks taken out of the library, from its hand-written catalog/removed-hooks.json.
   /docs/<slug> keeps answering for them with a "Removed" page. */
export type RemovedHook = {
  slug: string;
  name: string;
  /** The release that removed it; `null` until that release ships. */
  removedIn: string | null;
  /** The slug of the hook to use instead. */
  replacement: string | null;
  note: string;
};

export const REMOVED_HOOKS = removed as RemovedHook[];

export function getRemovedHook(slug: string): RemovedHook | undefined {
  return REMOVED_HOOKS.find((hook) => hook.slug === slug);
}
