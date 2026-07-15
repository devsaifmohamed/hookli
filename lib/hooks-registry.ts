/* Single source of truth for every hook page, the sidebar, search, sitemap and
   landing counts (docs/DESIGN.md §2, §6). Signatures verified against the
   hookli@1.4.0 type declarations. Adding a hook = one entry here + one demo
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
    slug: "use-session-storage",
    name: "useSessionStorage",
    description: "useState backed by sessionStorage, synced across tabs.",
    category: "state",
    signature:
      "useSessionStorage<T>(key: string, initialValue: T | (() => T), options?: UseSessionStorageOptions<T>): [T, (value: T | ((prev: T) => T)) => void, () => void]",
  },
  {
    slug: "use-read-local-storage",
    name: "useReadLocalStorage",
    description: "Read a localStorage key without writing it, reactively.",
    category: "state",
    signature:
      "useReadLocalStorage<T>(key: string, options?: UseReadLocalStorageOptions<T>): T | null",
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
    slug: "use-boolean",
    name: "useBoolean",
    description: "Boolean state with setTrue, setFalse, toggle and set.",
    category: "state",
    signature:
      "useBoolean(defaultValue?: boolean): { value: boolean; setValue: (value: boolean) => void; setTrue: () => void; setFalse: () => void; toggle: () => void }",
  },
  {
    slug: "use-counter",
    name: "useCounter",
    description: "Numeric counter with increment, decrement and reset.",
    category: "state",
    signature:
      "useCounter(initialValue?: number): { count: number; increment: () => void; decrement: () => void; reset: () => void; setCount: Dispatch<SetStateAction<number>> }",
  },
  {
    slug: "use-step",
    name: "useStep",
    description: "1-indexed step counter for wizards and steppers.",
    category: "state",
    signature: "useStep(maxStep: number): [number, UseStepActions]",
  },
  {
    slug: "use-countdown",
    name: "useCountdown",
    description: "Self-stopping countdown or count-up timer.",
    category: "state",
    signature:
      "useCountdown(options: UseCountdownOptions): [number, UseCountdownActions]",
  },
  {
    slug: "use-map",
    name: "useMap",
    description: "Manage a Map as immutable React state.",
    category: "state",
    signature:
      "useMap<K, V>(initialState?: MapOrEntries<K, V>): [ReadOnlyMap<K, V>, UseMapActions<K, V>]",
  },
  {
    slug: "use-debounce",
    name: "useDebounce",
    description: "Debounces a changing value.",
    category: "effects",
    signature: "useDebounce<T>(value: T, delay: number): T",
  },
  {
    slug: "use-debounce-value",
    name: "useDebounceValue",
    description: "State whose debounced copy updates after a pause.",
    category: "effects",
    signature:
      "useDebounceValue<T>(initialValue: T | (() => T), delayMs?: number, options?: DebounceOptions & { equalityFn?: (left: T, right: T) => boolean }): [T, DebouncedState<[T | ((prev: T) => T)], void>]",
  },
  {
    slug: "use-debounce-callback",
    name: "useDebounceCallback",
    description: "Debounces a callback, with cancel, flush and isPending.",
    category: "effects",
    signature:
      "useDebounceCallback<Args, R>(fn: (...args: Args) => R, delayMs?: number, options?: DebounceOptions): DebouncedState<Args, R>",
  },
  {
    slug: "use-interval",
    name: "useInterval",
    description: "Runs a callback on a fixed interval; pause by passing null.",
    category: "effects",
    signature: "useInterval(callback: () => void, delay: number | null): void",
  },
  {
    slug: "use-timeout",
    name: "useTimeout",
    description: "Runs a callback once after a delay; cancel by passing null.",
    category: "effects",
    signature: "useTimeout(callback: () => void, delay: number | null): void",
  },
  {
    slug: "use-isomorphic-layout-effect",
    name: "useIsomorphicLayoutEffect",
    description: "useLayoutEffect on the client, useEffect on the server.",
    category: "effects",
    signature:
      "useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList): void",
  },
  {
    slug: "use-event-callback",
    name: "useEventCallback",
    description: "A stable callback that always calls the latest closure.",
    category: "effects",
    signature:
      "useEventCallback<Args extends unknown[], R>(fn: (...args: Args) => R): (...args: Args) => R",
  },
  {
    slug: "use-unmount",
    name: "useUnmount",
    description: "Runs a cleanup function once, when the component unmounts.",
    category: "effects",
    signature: "useUnmount(fn: () => void): void",
  },
  {
    slug: "use-is-client",
    name: "useIsClient",
    description: "Reports false on the server and true after hydration.",
    category: "effects",
    signature: "useIsClient(): boolean",
  },
  {
    slug: "use-is-mounted",
    name: "useIsMounted",
    description: "A stable getter for whether the component is still mounted.",
    category: "effects",
    signature: "useIsMounted(): () => boolean",
  },
  {
    slug: "use-document-title",
    name: "useDocumentTitle",
    description: "Keeps document.title in sync with a value, SSR-safe.",
    category: "effects",
    signature:
      "useDocumentTitle(title: string, options?: UseDocumentTitleOptions): void",
  },
  {
    slug: "use-event-listener",
    name: "useEventListener",
    description: "Subscribe to a window, document or element event with cleanup.",
    category: "dom",
    signature:
      "useEventListener<K>(eventName: K, handler: (event: Event) => void, element?: RefObject<T>, options?: boolean | AddEventListenerOptions): void",
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
      "useMousePosition<T extends HTMLElement>(ref: RefObject<T>): { x: number | null; y: number | null }",
  },
  {
    slug: "use-infinite-scroll",
    name: "useInfiniteScroll",
    description: "Triggers loading near the scroll end.",
    category: "dom",
    signature:
      "useInfiniteScroll(fetchMoreData: () => Promise<void>): boolean",
  },
  {
    slug: "use-hover",
    name: "useHover",
    description: "Tracks whether the pointer is hovering an element.",
    category: "dom",
    signature:
      "useHover<T extends HTMLElement = HTMLElement>(elementRef: RefObject<T>): boolean",
  },
  {
    slug: "use-intersection-observer",
    name: "useIntersectionObserver",
    description: "Observe an element's viewport intersection reactively.",
    category: "dom",
    signature:
      "useIntersectionObserver(options?: UseIntersectionObserverOptions): UseIntersectionObserverReturn",
  },
  {
    slug: "use-resize-observer",
    name: "useResizeObserver",
    description: "Measure an element's size reactively via ResizeObserver.",
    category: "dom",
    signature:
      "useResizeObserver<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, options?: UseResizeObserverOptions): ResizeObserverSize",
  },
  {
    slug: "use-scroll-lock",
    name: "useScrollLock",
    description: "Lock and restore scrolling on the body or an element.",
    category: "dom",
    signature: "useScrollLock(options?: UseScrollLockOptions): UseScrollLockReturn",
  },
  {
    slug: "use-click-any-where",
    name: "useClickAnyWhere",
    description: "Run a handler on every click anywhere in the document.",
    category: "dom",
    signature:
      "useClickAnyWhere(handler: (event: MouseEvent) => void): void",
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
      "useGeoLocation(): { location: GeolocationPosition | null; error: GeolocationError | Error | null }",
  },
] as const;

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
