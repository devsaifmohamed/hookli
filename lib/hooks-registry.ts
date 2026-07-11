/* Single source of truth for every hook page, the sidebar, search, sitemap and
   landing counts (docs/DESIGN.md §2, §6). Signatures verified against the
   hookli@1.3.16 type declarations. Adding a hook = one entry here + one demo
   component in components/demos/. */

export type HookCategory = "state" | "effects" | "dom" | "data";

export type HookEntry = {
  slug: string;
  name: string;
  description: string;
  category: HookCategory;
  signature: string;
};

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

export const HOOKS: readonly HookEntry[] = [
  {
    slug: "use-toggle",
    name: "useToggle",
    description: "Boolean state with toggle and explicit set.",
    category: "state",
    signature:
      "useToggle(initialValue?: boolean): [boolean, () => void, (value: boolean) => void]",
  },
  {
    slug: "use-form",
    name: "useForm",
    description: "Controlled form state with one change handler.",
    category: "state",
    signature:
      "useForm<T>(initialState: T): { values: T; handleChange: (e: ChangeEvent) => void; resetForm: () => void }",
  },
  {
    slug: "use-local-storage",
    name: "useLocalStorage",
    description: "State persisted to localStorage.",
    category: "state",
    signature:
      "useLocalStorage<T>(key: string, initialValue: T): { value: T; setStoredValue: (value: T | ((val: T) => T)) => void }",
  },
  {
    slug: "use-local-storage-with-expiry",
    name: "useLocalStorageWithExpiry",
    description: "Persisted state with a TTL.",
    category: "state",
    signature:
      "useLocalStorageWithExpiry<T>(key: string, initialValue: T, expiryMs: number): { value: T | null; setStoredValue: (value: T) => void }",
  },
  {
    slug: "use-dark-mode",
    name: "useDarkMode",
    description: "Dark-mode boolean with toggle.",
    category: "state",
    signature:
      "useDarkMode(): { isDarkMode: boolean; toggleDarkMode: () => void }",
  },
  {
    slug: "use-debounce",
    name: "useDebounce",
    description: "Debounces a changing value.",
    category: "effects",
    signature: "useDebounce<T>(value: T, delay: number): T",
  },
  {
    slug: "use-click-outside",
    name: "useClickOutside",
    description: "Runs a callback on outside click.",
    category: "dom",
    signature:
      "useClickOutside<T extends HTMLElement>(ref: RefObject<T>, callback: () => void): void",
  },
  {
    slug: "use-mouse-position",
    name: "useMousePosition",
    description: "Cursor coordinates within an element.",
    category: "dom",
    signature:
      "useMousePosition<T extends HTMLElement>(ref: RefObject<T>): { x: number; y: number }",
  },
  {
    slug: "use-infinite-scroll",
    name: "useInfiniteScroll",
    description: "Triggers loading near the scroll end.",
    category: "dom",
    signature: "useInfiniteScroll(fetchMoreData: () => void): boolean",
  },
  {
    slug: "use-fetch",
    name: "useFetch",
    description: "Declarative fetch with loading and error status.",
    category: "data",
    signature:
      "useFetch<T>(url: string): { data: T | null; loading: boolean; error: Error | null }",
  },
  {
    slug: "use-geo-location",
    name: "useGeoLocation",
    description: "Browser geolocation state.",
    category: "data",
    signature:
      "useGeoLocation(): { location: GeolocationCoordinates | null; error: string | null }",
  },
] as const;

export function getHook(slug: string): HookEntry | undefined {
  return HOOKS.find((hook) => hook.slug === slug);
}

export function hooksByCategory(category: HookCategory): HookEntry[] {
  return HOOKS.filter((hook) => hook.category === category);
}
