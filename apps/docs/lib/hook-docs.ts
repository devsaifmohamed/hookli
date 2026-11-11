import type { ComponentType } from "react";
import type { ApiRow } from "@/components/api-table";
import { UseAsyncDocDemo } from "@/components/demos/use-async-demo";
import { UseBatteryDocDemo } from "@/components/demos/use-battery-demo";
import { UseBooleanDocDemo } from "@/components/demos/use-boolean-demo";
import { UseClickAnyWhereDocDemo } from "@/components/demos/use-click-any-where-demo";
import { UseClickOutsideDocDemo } from "@/components/demos/use-click-outside-demo";
import { UseCopyToClipboardDocDemo } from "@/components/demos/use-copy-to-clipboard-demo";
import { UseCountdownDocDemo } from "@/components/demos/use-countdown-demo";
import { UseCounterDocDemo } from "@/components/demos/use-counter-demo";
import { UseDarkModeDocDemo } from "@/components/demos/use-dark-mode-demo";
import { UseDebounceDocDemo } from "@/components/demos/use-debounce-demo";
import { UseDebounceCallbackDocDemo } from "@/components/demos/use-debounce-callback-demo";
import { UseDebounceValueDocDemo } from "@/components/demos/use-debounce-value-demo";
import { UseDeepCompareEffectDocDemo } from "@/components/demos/use-deep-compare-effect-demo";
import { UseDefaultValueDocDemo } from "@/components/demos/use-default-value-demo";
import { UseDocumentTitleDocDemo } from "@/components/demos/use-document-title-demo";
import { UseDraggableDocDemo } from "@/components/demos/use-draggable-demo";
import { UseEffectOnceDocDemo } from "@/components/demos/use-effect-once-demo";
import { UseEventCallbackDocDemo } from "@/components/demos/use-event-callback-demo";
import { UseEventListenerDocDemo } from "@/components/demos/use-event-listener-demo";
import { UseExpandableTextDocDemo } from "@/components/demos/use-expandable-text-demo";
import { UseFetchDocDemo } from "@/components/demos/use-fetch-demo";
import { UseFormDocDemo } from "@/components/demos/use-form-demo";
import { UseFullscreenDocDemo } from "@/components/demos/use-fullscreen-demo";
import { UseGeoLocationDocDemo } from "@/components/demos/use-geo-location-demo";
import { UseHotkeysDocDemo } from "@/components/demos/use-hotkeys-demo";
import { UseHoverDocDemo } from "@/components/demos/use-hover-demo";
import { UseIdleDocDemo } from "@/components/demos/use-idle-demo";
import { UseInfiniteScrollDocDemo } from "@/components/demos/use-infinite-scroll-demo";
import { UseIntersectionObserverDocDemo } from "@/components/demos/use-intersection-observer-demo";
import { UseIntervalDocDemo } from "@/components/demos/use-interval-demo";
import { UseIsClientDocDemo } from "@/components/demos/use-is-client-demo";
import { UseIsMountedDocDemo } from "@/components/demos/use-is-mounted-demo";
import { UseIsomorphicLayoutEffectDocDemo } from "@/components/demos/use-isomorphic-layout-effect-demo";
import { UseKeyPressDocDemo } from "@/components/demos/use-key-press-demo";
import { UseListDocDemo } from "@/components/demos/use-list-demo";
import { UseLocalStorageDocDemo } from "@/components/demos/use-local-storage-demo";
import { UseLocalStorageWithExpiryDocDemo } from "@/components/demos/use-local-storage-with-expiry-demo";
import { UseLongPressDocDemo } from "@/components/demos/use-long-press-demo";
import { UseMapDocDemo } from "@/components/demos/use-map-demo";
import { UseMediaQueryDocDemo } from "@/components/demos/use-media-query-demo";
import { UseMousePositionDocDemo } from "@/components/demos/use-mouse-position-demo";
import { UseMutationDocDemo } from "@/components/demos/use-mutation-demo";
import { UseNetworkStateDocDemo } from "@/components/demos/use-network-state-demo";
import { UsePageVisibilityDocDemo } from "@/components/demos/use-page-visibility-demo";
import { UsePaginationDocDemo } from "@/components/demos/use-pagination-demo";
import { UsePermissionDocDemo } from "@/components/demos/use-permission-demo";
import { UsePreviousDocDemo } from "@/components/demos/use-previous-demo";
import { UseQueueDocDemo } from "@/components/demos/use-queue-demo";
import { UseRafStateDocDemo } from "@/components/demos/use-raf-state-demo";
import { UseReadLocalStorageDocDemo } from "@/components/demos/use-read-local-storage-demo";
import { UseResizeObserverDocDemo } from "@/components/demos/use-resize-observer-demo";
import { UseScreenDocDemo } from "@/components/demos/use-screen-demo";
import { UseScriptDocDemo } from "@/components/demos/use-script-demo";
import { UseScrollLockDocDemo } from "@/components/demos/use-scroll-lock-demo";
import { UseSessionStorageDocDemo } from "@/components/demos/use-session-storage-demo";
import { UseSetDocDemo } from "@/components/demos/use-set-demo";
import { UseStepDocDemo } from "@/components/demos/use-step-demo";
import { UseTernaryDarkModeDocDemo } from "@/components/demos/use-ternary-dark-mode-demo";
import { UseTextSelectionDocDemo } from "@/components/demos/use-text-selection-demo";
import { UseThrottleDocDemo } from "@/components/demos/use-throttle-demo";
import { UseTimeoutDocDemo } from "@/components/demos/use-timeout-demo";
import { UseToggleDocDemo } from "@/components/demos/use-toggle-demo";
import { UseUnmountDocDemo } from "@/components/demos/use-unmount-demo";
import { UseUpdateEffectDocDemo } from "@/components/demos/use-update-effect-demo";
import { UseWindowScrollDocDemo } from "@/components/demos/use-window-scroll-demo";
import { UseWindowSizeDocDemo } from "@/components/demos/use-window-size-demo";

/* Per-hook page content layered on top of the registry entry (docs/DESIGN.md
   §4): live demo component, usage snippet (shown in the HookDemo Code tab AND
   the Usage section — one string, always identical), API tables. T7–T10 add
   the remaining hooks; a slug without an entry renders the signature-only
   scaffold. Data here must match the hookli@1.3.16 type declarations. */

/* A named type referenced by the signature (e.g. GeolocationPosition), rendered
   as its own Name/Type/Description table below the Returns table (T16). */
export type TypeAlias = {
  name: string;
  description?: string;
  rows: readonly ApiRow[];
};

export type HookDoc = {
  demo: ComponentType;
  usage: string;
  parameters: readonly ApiRow[];
  returns: readonly ApiRow[];
  typeAliases?: readonly TypeAlias[];
};

/* Shared by the two debounce hooks (useDebounceValue + useDebounceCallback),
   which both take DebounceOptions and return a DebouncedState. */
const DEBOUNCE_OPTIONS_ALIAS: TypeAlias = {
  name: "DebounceOptions",
  description: "Controls how the debounced invocation is scheduled.",
  rows: [
    {
      name: "leading",
      type: "boolean",
      defaultValue: "false",
      description: "Invoke on the leading edge — run once immediately on the first call of a burst.",
    },
    {
      name: "trailing",
      type: "boolean",
      defaultValue: "true",
      description: "Invoke on the trailing edge — run after the burst settles.",
    },
    {
      name: "maxWait",
      type: "number",
      description: "The maximum time the callback may be delayed before it is forced to run, even during a continuous burst.",
    },
  ],
};

const DEBOUNCED_STATE_ALIAS: TypeAlias = {
  name: "DebouncedState<Args, R>",
  description: "The debounced function, plus manual control methods.",
  rows: [
    {
      name: "(...args)",
      type: "(...args: Args) => R | undefined",
      description: "Calling it schedules an invocation and returns the last computed result — undefined before the first run.",
    },
    {
      name: "cancel",
      type: "() => void",
      description: "Cancels any pending trailing invocation.",
    },
    {
      name: "flush",
      type: "() => R | undefined",
      description: "Immediately runs any pending invocation and returns its result.",
    },
    {
      name: "isPending",
      type: "() => boolean",
      description: "Whether a trailing invocation is currently scheduled.",
    },
  ],
};

/* Options for the sessionStorage hook (serializer/deserializer + hydration). */
const SESSION_STORAGE_OPTIONS_ALIAS: TypeAlias = {
  name: "UseSessionStorageOptions<T>",
  description: "Custom (de)serialization and hydration behaviour.",
  rows: [
    {
      name: "serializer",
      type: "(value: T) => string",
      description: "Turn the value into the string stored under the key. Defaults to JSON.stringify.",
    },
    {
      name: "deserializer",
      type: "(value: string) => T",
      description: "Parse the stored string back into a value. Defaults to JSON.parse.",
    },
    {
      name: "initializeWithValue",
      type: "boolean",
      defaultValue: "true",
      description: "Read sessionStorage synchronously on mount. Set false to defer to after hydration and avoid SSR mismatches.",
    },
  ],
};

/* Options for the read-only localStorage hook (deserializer + hydration). */
const READ_LOCAL_STORAGE_OPTIONS_ALIAS: TypeAlias = {
  name: "UseReadLocalStorageOptions<T>",
  description: "Custom deserialization and hydration behaviour.",
  rows: [
    {
      name: "deserializer",
      type: "(value: string) => T",
      description: "Parse the stored string into a value. Defaults to JSON.parse, falling back to the raw string.",
    },
    {
      name: "initializeWithValue",
      type: "boolean",
      defaultValue: "true",
      description: "Read localStorage synchronously on mount. Set false to defer to after hydration and avoid SSR mismatches.",
    },
  ],
};

/* Options + return shape for the three-state dark-mode hook (DH9). */
const TERNARY_DARK_MODE_OPTIONS_ALIAS: TypeAlias = {
  name: "UseTernaryDarkModeOptions",
  description: "Optional starting mode and persistence key.",
  rows: [
    {
      name: "defaultValue",
      type: "TernaryDarkMode",
      defaultValue: '"system"',
      description: 'The mode before anything is stored: "system", "dark" or "light".',
    },
    {
      name: "localStorageKey",
      type: "string",
      defaultValue: '"hookli-ternary-dark-mode"',
      description: "The localStorage key the choice is persisted under.",
    },
  ],
};

const TERNARY_DARK_MODE_RETURN_ALIAS: TypeAlias = {
  name: "UseTernaryDarkModeReturn",
  description: "The resolved mode plus setters.",
  rows: [
    {
      name: "isDarkMode",
      type: "boolean",
      description: 'True when the mode is "dark", or "system" while the OS prefers dark.',
    },
    {
      name: "ternaryDarkMode",
      type: "TernaryDarkMode",
      description: 'The stored preference: "system" | "dark" | "light".',
    },
    {
      name: "setTernaryDarkMode",
      type: "(value: TernaryDarkMode | ((prev: TernaryDarkMode) => TernaryDarkMode)) => void",
      description: "Set the preference directly; accepts a value or an updater.",
    },
    {
      name: "toggleTernaryDarkMode",
      type: "() => void",
      description: "Cycle the preference: light → system → dark → light.",
    },
  ],
};

/* Options for the external-script loader (DH9). */
const SCRIPT_OPTIONS_ALIAS: TypeAlias = {
  name: "UseScriptOptions",
  description: "Flags controlling when the script loads and unloads.",
  rows: [
    {
      name: "shouldPreventLoad",
      type: "boolean",
      defaultValue: "false",
      description: 'Keep the status "idle" without injecting the script — useful for deferring a load.',
    },
    {
      name: "removeOnUnmount",
      type: "boolean",
      defaultValue: "false",
      description: "Remove the injected <script> tag when the component unmounts.",
    },
  ],
};

const USE_LIST_ACTIONS_ALIAS: TypeAlias = {
  name: "UseListActions<T>",
  description: "Actions returned by useList for manipulating the array immutably.",
  rows: [
    {
      name: "set",
      type: "(list: T[]) => void",
      description: "Replaces the entire list with a new array.",
    },
    {
      name: "push",
      type: "(...items: T[]) => void",
      description: "Appends one or more items to the end of the list.",
    },
    {
      name: "insertAt",
      type: "(index: number, item: T) => void",
      description: "Inserts an item at the specified index.",
    },
    {
      name: "updateAt",
      type: "(index: number, item: T) => void",
      description: "Replaces the item at the specified index.",
    },
    {
      name: "removeAt",
      type: "(index: number) => void",
      description: "Removes the item at the specified index.",
    },
    {
      name: "clear",
      type: "() => void",
      description: "Empties the list.",
    },
    {
      name: "reset",
      type: "() => void",
      description: "Resets the list to its initial value.",
    },
  ],
};

const USE_SET_ACTIONS_ALIAS: TypeAlias = {
  name: "UseSetActions<T>",
  description: "Actions returned by useSet for manipulating the Set immutably.",
  rows: [
    {
      name: "add",
      type: "(value: T) => void",
      description: "Adds a value to the set.",
    },
    {
      name: "remove",
      type: "(value: T) => void",
      description: "Removes a value from the set.",
    },
    {
      name: "toggle",
      type: "(value: T) => void",
      description: "Adds the value if absent, removes it if present.",
    },
    {
      name: "has",
      type: "(value: T) => boolean",
      description: "Returns whether the value is currently in the set.",
    },
    {
      name: "clear",
      type: "() => void",
      description: "Empties the set.",
    },
    {
      name: "reset",
      type: "() => void",
      description: "Resets the set to its initial values.",
    },
  ],
};

const USE_QUEUE_RETURN_ALIAS: TypeAlias = {
  name: "UseQueueReturn<T>",
  description: "Object returned by useQueue containing queue state and actions.",
  rows: [
    {
      name: "queue",
      type: "T[]",
      description: "The current queue array, oldest item first.",
    },
    {
      name: "add",
      type: "(item: T) => void",
      description: "Enqueues an item at the end of the queue.",
    },
    {
      name: "remove",
      type: "() => T | undefined",
      description: "Dequeues the oldest item and returns it (or undefined if empty).",
    },
    {
      name: "clear",
      type: "() => void",
      description: "Empties the queue.",
    },
    {
      name: "first",
      type: "T | undefined",
      description: "The oldest item at the front of the queue.",
    },
    {
      name: "last",
      type: "T | undefined",
      description: "The newest item at the back of the queue.",
    },
    {
      name: "size",
      type: "number",
      description: "The number of items currently in the queue.",
    },
  ],
};

const USE_ASYNC_RETURN_ALIAS: TypeAlias = {
  name: "UseAsyncReturn<T>",
  description: "State and execution handler returned by useAsync.",
  rows: [
    { name: "loading", type: "boolean", description: "Whether the async function is currently running." },
    { name: "error", type: "Error | null", description: "The error thrown by the last run, or null." },
    { name: "value", type: "T | null", description: "The resolved value from the last run, or null." },
    { name: "execute", type: "() => Promise<void>", description: "Re-triggers execution of the async function." },
  ],
};

const USE_MUTATION_RETURN_ALIAS: TypeAlias = {
  name: "UseMutationReturn<TArgs, TData>",
  description: "Object returned by useMutation containing mutation state and actions.",
  rows: [
    { name: "mutate", type: "(...args: TArgs) => Promise<TData | undefined>", description: "Executes the async mutation." },
    { name: "status", type: '"idle" | "loading" | "success" | "error"', description: "Current mutation lifecycle status." },
    { name: "isLoading", type: "boolean", description: "Convenience boolean for status === 'loading'." },
    { name: "data", type: "TData | null", description: "Data returned by the last successful mutation." },
    { name: "error", type: "Error | null", description: "Error thrown by the last failed mutation." },
    { name: "reset", type: "() => void", description: "Resets status, data, and error back to idle." },
  ],
};

const USE_PAGINATION_RETURN_ALIAS: TypeAlias = {
  name: "UsePaginationReturn",
  description: "Pagination state and navigation helpers returned by usePagination.",
  rows: [
    { name: "page", type: "number", description: "Current page number (1-indexed)." },
    { name: "pageSize", type: "number", description: "Number of items per page." },
    { name: "totalPages", type: "number", description: "Total number of pages." },
    { name: "setPage", type: "(page: number) => void", description: "Jumps directly to a specific page." },
    { name: "next", type: "() => void", description: "Advances to the next page." },
    { name: "prev", type: "() => void", description: "Moves to the previous page." },
    { name: "first", type: "() => void", description: "Jumps to page 1." },
    { name: "last", type: "() => void", description: "Jumps to the last page." },
    { name: "canNext", type: "boolean", description: "Whether a subsequent page exists." },
    { name: "canPrev", type: "boolean", description: "Whether an earlier page exists." },
    { name: "range", type: "{ start: number; end: number }", description: "Zero-based item indices for the current page." },
  ],
};

const USE_FULLSCREEN_RETURN_ALIAS: TypeAlias = {
  name: "UseFullscreenReturn",
  description: "Fullscreen state and control actions returned by useFullscreen.",
  rows: [
    { name: "isFullscreen", type: "boolean", description: "Whether the target element is currently fullscreen." },
    { name: "enter", type: "() => Promise<void>", description: "Requests fullscreen for the referenced element." },
    { name: "exit", type: "() => Promise<void>", description: "Exits fullscreen." },
    { name: "toggle", type: "() => Promise<void>", description: "Toggles between fullscreen and normal state." },
  ],
};

const USE_NETWORK_STATE_ALIAS: TypeAlias = {
  name: "NetworkState",
  description: "Snapshot of the browser connection returned by useNetworkState.",
  rows: [
    { name: "online", type: "boolean", description: "Whether the browser has network connectivity." },
    { name: "effectiveType", type: "string | undefined", description: "Effective connection type (e.g. '4g')." },
    { name: "downlink", type: "number | undefined", description: "Estimated bandwidth in megabits per second." },
    { name: "rtt", type: "number | undefined", description: "Estimated round-trip time in milliseconds." },
    { name: "saveData", type: "boolean | undefined", description: "Whether user enabled data-saving mode." },
  ],
};

const USE_BATTERY_STATE_ALIAS: TypeAlias = {
  name: "BatteryState",
  description: "Snapshot of device battery status returned by useBattery.",
  rows: [
    { name: "supported", type: "boolean", description: "Whether the Battery Status API is supported in this browser." },
    { name: "loading", type: "boolean", description: "Whether initial battery status is being queried." },
    { name: "level", type: "number | null", description: "Battery charge level between 0 and 1." },
    { name: "charging", type: "boolean | null", description: "Whether the device is plugged in and charging." },
    { name: "chargingTime", type: "number | null", description: "Seconds until battery is fully charged." },
    { name: "dischargingTime", type: "number | null", description: "Seconds until battery is completely discharged." },
  ],
};

const HOOK_DOCS: Partial<Record<string, HookDoc>> = {
  "use-toggle": {
    demo: UseToggleDocDemo,
    usage: `
import { useToggle } from "hookli";

export function Demo() {
  const [on, toggle, setOn] = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>{on ? "On" : "Off"}</button>
      <button onClick={() => setOn(true)}>Set on</button>
      <button onClick={() => setOn(false)}>Set off</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialValue",
        type: "boolean",
        defaultValue: "false",
        description: "The value the toggle starts from.",
      },
    ],
    returns: [
      {
        name: "[0] value",
        type: "boolean",
        description: "The current boolean state.",
      },
      {
        name: "[1] toggle",
        type: "() => void",
        description: "Flips the value.",
      },
      {
        name: "[2] setValue",
        type: "(value: boolean) => void",
        description: "Sets the value explicitly.",
      },
    ],
  },
  "use-debounce": {
    demo: UseDebounceDocDemo,
    usage: `
import { useState } from "react";
import { useDebounce } from "hookli";

export function Demo() {
  const [text, setText] = useState("");
  const debounced = useDebounce(text, 500);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Value: {text}</p>
      <p>Debounced: {debounced}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "value",
        type: "T",
        description: "The value to debounce — any type works.",
      },
      {
        name: "delay",
        type: "number",
        description: "Milliseconds the value must stay unchanged before the debounced value updates.",
      },
    ],
    returns: [
      {
        name: "debouncedValue",
        type: "T",
        description: "Trails the input value, updating only after delay ms without a change.",
      },
    ],
  },
  "use-debounce-value": {
    demo: UseDebounceValueDocDemo,
    usage: `
import { useState } from "react";
import { useDebounceValue } from "hookli";

export function Demo() {
  const [text, setText] = useState("");
  const [debounced, setValue] = useDebounceValue("", 500);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setValue(e.target.value);
        }}
      />
      <p>Debounced: {debounced}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialValue",
        type: "T | (() => T)",
        description: "The starting value, or a factory evaluated once on mount — the same lazy-initializer contract as useState.",
      },
      {
        name: "delayMs",
        type: "number",
        defaultValue: "500",
        description: "Milliseconds of inactivity before the debounced value catches up to the latest set value.",
      },
      {
        name: "options",
        type: "DebounceOptions & { equalityFn? }",
        defaultValue: "{}",
        description: "DebounceOptions plus an optional equalityFn (left, right) => boolean — when it reports the values equal, the debounced update is skipped. See the tables below.",
      },
    ],
    returns: [
      {
        name: "[0] debouncedValue",
        type: "T",
        description: "The value that trails the setter, updating only after delayMs of quiet.",
      },
      {
        name: "[1] setValue",
        type: "DebouncedState<[T | ((prev: T) => T)], void>",
        description: "A debounced setter accepting a value or updater; it also carries cancel, flush and isPending (see DebouncedState).",
      },
    ],
    typeAliases: [DEBOUNCE_OPTIONS_ALIAS, DEBOUNCED_STATE_ALIAS],
  },
  "use-debounce-callback": {
    demo: UseDebounceCallbackDocDemo,
    usage: `
import { useState } from "react";
import { useDebounceCallback } from "hookli";

export function Demo() {
  const [query, setQuery] = useState("");

  const search = useDebounceCallback((q: string) => {
    console.log("searching", q);
  }, 600);

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        search(e.target.value);
      }}
    />
  );
}
`,
    parameters: [
      {
        name: "fn",
        type: "(...args: Args) => R",
        description: "The function to debounce. The returned function keeps a stable identity across renders but always invokes the latest fn.",
      },
      {
        name: "delayMs",
        type: "number",
        defaultValue: "500",
        description: "Milliseconds to wait after the last call before fn runs.",
      },
      {
        name: "options",
        type: "DebounceOptions",
        defaultValue: "{}",
        description: "Leading/trailing edge and maxWait behaviour. See the table below.",
      },
    ],
    returns: [
      {
        name: "debounced",
        type: "DebouncedState<Args, R>",
        description: "A debounced version of fn with a stable identity, carrying cancel, flush and isPending. Any pending call is cancelled on unmount.",
      },
    ],
    typeAliases: [DEBOUNCE_OPTIONS_ALIAS, DEBOUNCED_STATE_ALIAS],
  },
  "use-interval": {
    demo: UseIntervalDocDemo,
    usage: `
import { useState } from "react";
import { useInterval } from "hookli";

export function Demo() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);

  useInterval(() => setCount((prev) => prev + 1), running ? 1000 : null);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setRunning((prev) => !prev)}>
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "callback",
        type: "() => void",
        description: "Runs on every tick. Always fires the latest callback — the hook keeps a ref, so you never re-arm the timer just to close over fresh state.",
      },
      {
        name: "delay",
        type: "number | null",
        description: "Milliseconds between ticks. Pass null to pause — the interval is cleared, so nothing runs until you set a number again.",
      },
    ],
    returns: [],
  },
  "use-timeout": {
    demo: UseTimeoutDocDemo,
    usage: `
import { useState } from "react";
import { useTimeout } from "hookli";

export function Demo() {
  const [visible, setVisible] = useState(false);
  const [delay, setDelay] = useState<number | null>(null);

  useTimeout(() => {
    setVisible(true);
    setDelay(null);
  }, delay);

  return (
    <div>
      <button onClick={() => setDelay(2000)}>Reveal in 2s</button>
      {visible && <p>Here!</p>}
    </div>
  );
}
`,
    parameters: [
      {
        name: "callback",
        type: "() => void",
        description: "Runs once after the delay elapses. The hook keeps a ref to the latest callback, so it always fires with fresh state.",
      },
      {
        name: "delay",
        type: "number | null",
        description: "Milliseconds to wait before firing. Pass null to disable — a change to null before the delay elapses cancels the pending timeout.",
      },
    ],
    returns: [],
  },
  "use-isomorphic-layout-effect": {
    demo: UseIsomorphicLayoutEffectDocDemo,
    usage: `
import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "hookli";

export function Demo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    setWidth(boxRef.current?.offsetWidth ?? 0);
  }, []);

  return <div ref={boxRef}>Measured: {width}px</div>;
}
`,
    parameters: [
      {
        name: "effect",
        type: "EffectCallback",
        description: "The effect to run — same contract as React's useLayoutEffect, including an optional cleanup return.",
      },
      {
        name: "deps",
        type: "DependencyList",
        description: "Dependency array controlling when the effect re-runs. Omit to run after every render.",
      },
    ],
    returns: [],
  },
  "use-event-callback": {
    demo: UseEventCallbackDocDemo,
    usage: `
import { useState } from "react";
import { useEventCallback } from "hookli";

export function Demo() {
  const [count, setCount] = useState(0);

  const readLatest = useEventCallback(() => count);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
      <button onClick={() => alert(readLatest())}>Read latest</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "fn",
        type: "(...args: Args) => R",
        description: "The function to keep current behind a stable reference. Calling during render throws — it is meant for event handlers and effects.",
      },
    ],
    returns: [
      {
        name: "callback",
        type: "(...args: Args) => R",
        description: "A memoized callback with an unchanging identity that always forwards to the latest fn.",
      },
    ],
  },
  "use-unmount": {
    demo: UseUnmountDocDemo,
    usage: `
import { useUnmount } from "hookli";

export function Demo() {
  useUnmount(() => {
    console.log("cleanup on unmount");
  });

  return <p>Watch the console when I unmount.</p>;
}
`,
    parameters: [
      {
        name: "fn",
        type: "() => void",
        description: "Called exactly once when the component unmounts. The latest closure is captured in a ref, so it always sees fresh values.",
      },
    ],
    returns: [],
  },
  "use-is-client": {
    demo: UseIsClientDocDemo,
    usage: `
import { useIsClient } from "hookli";

export function Demo() {
  const isClient = useIsClient();

  if (!isClient) return <p>Rendering on the server…</p>;

  return <p>Now running in the browser.</p>;
}
`,
    parameters: [],
    returns: [
      {
        name: "isClient",
        type: "boolean",
        description: "false during server rendering and the first hydration pass, then true once mounted in the browser. Gate browser-only UI on it to keep both renders identical.",
      },
    ],
  },
  "use-is-mounted": {
    demo: UseIsMountedDocDemo,
    usage: `
import { useIsMounted } from "hookli";

export function Demo() {
  const isMounted = useIsMounted();

  async function load() {
    const data = await fetchData();
    if (isMounted()) setData(data);
  }

  return <button onClick={load}>Load</button>;
}
`,
    parameters: [],
    returns: [
      {
        name: "isMounted",
        type: "() => boolean",
        description:
          "A stable getter that returns true while mounted and false after unmount. Call it inside async callbacks before setting state; its identity never changes, so it is safe to omit from dependency arrays.",
      },
    ],
  },
  "use-document-title": {
    demo: UseDocumentTitleDocDemo,
    usage: `
import { useDocumentTitle } from "hookli";

export function Demo() {
  useDocumentTitle("Dashboard — hookli", {
    preserveTitleOnUnmount: false,
  });

  return <h1>Dashboard</h1>;
}
`,
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The document title to apply. Written to document.title in a layout effect on the client and skipped during server rendering.",
      },
      {
        name: "options",
        type: "UseDocumentTitleOptions",
        defaultValue: "{}",
        description: "Behaviour options (see below).",
      },
    ],
    returns: [],
    typeAliases: [
      {
        name: "UseDocumentTitleOptions",
        description: "Options controlling unmount behaviour.",
        rows: [
          {
            name: "preserveTitleOnUnmount",
            type: "boolean",
            defaultValue: "true",
            description: "When false, the title captured on mount is restored when the component unmounts. Defaults to true, which leaves the title in place.",
          },
        ],
      },
    ],
  },
  "use-event-listener": {
    demo: UseEventListenerDocDemo,
    usage: `
import { useRef, useState } from "react";
import { useEventListener } from "hookli";

export function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const [lastKey, setLastKey] = useState("");

  useEventListener("keydown", (event) => setLastKey(event.key));
  useEventListener("click", () => console.log("clicked"), ref);

  return <div ref={ref}>Last key: {lastKey}</div>;
}
`,
    parameters: [
      {
        name: "eventName",
        type: "K",
        description: "The event to listen for, typed against the target's event map (window, document, media query, or element).",
      },
      {
        name: "handler",
        type: "(event) => void",
        description: "Called with the typed event on every dispatch. Held in a ref, so updating it never detaches and re-attaches the listener.",
      },
      {
        name: "element",
        type: "RefObject<T>",
        defaultValue: "window",
        description: "Optional ref to the target. Defaults to window when omitted.",
      },
      {
        name: "options",
        type: "boolean | AddEventListenerOptions",
        description: "Standard addEventListener options (capture, passive, once).",
      },
    ],
    returns: [],
  },
  "use-form": {
    demo: UseFormDocDemo,
    usage: `
import { useForm } from "hookli";

export function Demo() {
  const { values, handleChange, resetForm } = useForm({ name: "", email: "" });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input name="name" value={values.name} onChange={handleChange} />
      <input name="email" type="email" value={values.email} onChange={handleChange} />
      <button type="button" onClick={resetForm}>Reset</button>
    </form>
  );
}
`,
    parameters: [
      {
        name: "initialState",
        type: "T",
        description: "Initial field values. Keys must match the name attribute of each input.",
      },
    ],
    returns: [
      {
        name: "values",
        type: "T",
        description: "The current form values.",
      },
      {
        name: "handleChange",
        type: "(event: ChangeEvent) => void",
        description: "One change handler for every named input, textarea and select.",
      },
      {
        name: "resetForm",
        type: "() => void",
        description: "Restores initialState.",
      },
    ],
  },
  "use-local-storage": {
    demo: UseLocalStorageDocDemo,
    usage: `
import { useLocalStorage } from "hookli";

export function Demo() {
  const { value, setStoredValue } = useLocalStorage("note", "");

  return (
    <div>
      <input value={value} onChange={(e) => setStoredValue(e.target.value)} />
      <button type="button" onClick={() => setStoredValue("")}>Clear</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "key",
        type: "string",
        description: "The localStorage key to read and write.",
      },
      {
        name: "initialValue",
        type: "T",
        description: "Value used before hydration and when the key is empty. Prefer a stable reference — the sync effect depends on it.",
      },
    ],
    returns: [
      {
        name: "value",
        type: "T",
        description: "The stored value. Server-rendered as initialValue, then synced from localStorage after mount.",
      },
      {
        name: "setStoredValue",
        type: "(value: T | ((val: T) => T)) => void",
        description: "Persists to localStorage and updates state; accepts a value or an updater function.",
      },
    ],
  },
  "use-local-storage-with-expiry": {
    demo: UseLocalStorageWithExpiryDocDemo,
    usage: `
import { useLocalStorageWithExpiry } from "hookli";

export function Demo() {
  const { value, setStoredValue } = useLocalStorageWithExpiry(
    "draft",
    "",
    10_000,
  );

  return (
    <div>
      <button onClick={() => setStoredValue("hello")}>Save for 10s</button>
      <p>{value === null ? "Expired" : value || "Nothing stored"}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "key",
        type: "string",
        description: "The localStorage key to read and write.",
      },
      {
        name: "initialValue",
        type: "T",
        description: "Value used before hydration and when nothing is stored under the key.",
      },
      {
        name: "expiryMs",
        type: "number",
        description: "Time-to-live in milliseconds. Every write stores the value with a fresh expiry timestamp.",
      },
    ],
    returns: [
      {
        name: "value",
        type: "T | null",
        description: "The stored value, or null once the item has expired. Expiry is checked when the hook reads — on mount or key change — at which point the item is removed.",
      },
      {
        name: "setStoredValue",
        type: "(value: T) => void",
        description: "Persists the value to localStorage with a new expiry of now + expiryMs.",
      },
    ],
  },
  "use-session-storage": {
    demo: UseSessionStorageDocDemo,
    usage: `
import { useSessionStorage } from "hookli";

export function Demo() {
  const [draft, setDraft, removeDraft] = useSessionStorage("draft", "");

  return (
    <div>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button type="button" onClick={removeDraft}>Clear</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "key",
        type: "string",
        description: "The sessionStorage key to read and write.",
      },
      {
        name: "initialValue",
        type: "T | (() => T)",
        description: "Value used before hydration and when the key is empty. Pass a function to compute it lazily.",
      },
      {
        name: "options",
        type: "UseSessionStorageOptions<T>",
        defaultValue: "{}",
        description: "Optional custom serializer/deserializer and hydration flag.",
      },
    ],
    returns: [
      {
        name: "[0] value",
        type: "T",
        description: "The stored value. Server-rendered as initialValue, then hydrated from sessionStorage after mount.",
      },
      {
        name: "[1] setValue",
        type: "(value: T | ((prev: T) => T)) => void",
        description: "Persists to sessionStorage and updates state; accepts a value or an updater. Syncs every hook using the key in this tab.",
      },
      {
        name: "[2] removeValue",
        type: "() => void",
        description: "Removes the key from sessionStorage and resets state to initialValue.",
      },
    ],
    typeAliases: [SESSION_STORAGE_OPTIONS_ALIAS],
  },
  "use-read-local-storage": {
    demo: UseReadLocalStorageDocDemo,
    usage: `
import { useReadLocalStorage } from "hookli";

export function Demo() {
  const theme = useReadLocalStorage<string>("theme");

  return <p>Saved theme: {theme ?? "none"}</p>;
}
`,
    parameters: [
      {
        name: "key",
        type: "string",
        description: "The localStorage key to observe.",
      },
      {
        name: "options",
        type: "UseReadLocalStorageOptions<T>",
        defaultValue: "{}",
        description: "Optional custom deserializer and hydration flag.",
      },
    ],
    returns: [
      {
        name: "value",
        type: "T | null",
        description: "The parsed value, or null when the key is absent. Re-renders when the key changes in another tab (storage event) or via a local-storage event dispatched in this tab.",
      },
    ],
    typeAliases: [READ_LOCAL_STORAGE_OPTIONS_ALIAS],
  },
  "use-dark-mode": {
    demo: UseDarkModeDocDemo,
    usage: `
import { useDarkMode } from "hookli";

export function Demo() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={isDarkMode ? "panel-dark" : "panel-light"}>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? "Switch to light" : "Switch to dark"}
      </button>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "isDarkMode",
        type: "boolean",
        description: 'Current mode. Initialized from localStorage("theme") on the client; false during SSR.',
      },
      {
        name: "toggleDarkMode",
        type: "() => void",
        description: 'Flips the mode. An effect persists it to localStorage("theme") and toggles a "dark" class on <body>.',
      },
    ],
  },
  "use-ternary-dark-mode": {
    demo: UseTernaryDarkModeDocDemo,
    usage: `
import { useTernaryDarkMode } from "hookli";

export function Demo() {
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } =
    useTernaryDarkMode();

  return (
    <div className={isDarkMode ? "panel-dark" : "panel-light"}>
      <select
        value={ternaryDarkMode}
        onChange={(e) => setTernaryDarkMode(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="system">System</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UseTernaryDarkModeOptions",
        defaultValue: "{}",
        description: "Optional starting mode and localStorage key.",
      },
    ],
    returns: [
      {
        name: "{ … }",
        type: "UseTernaryDarkModeReturn",
        description: "The resolved isDarkMode boolean, the stored ternary preference, and its setters.",
      },
    ],
    typeAliases: [
      {
        name: "TernaryDarkMode",
        description: "The three possible preferences.",
        rows: [
          {
            name: "value",
            type: '"system" | "dark" | "light"',
            description: '"system" resolves against the OS; "dark"/"light" force a mode.',
          },
        ],
      },
      TERNARY_DARK_MODE_OPTIONS_ALIAS,
      TERNARY_DARK_MODE_RETURN_ALIAS,
    ],
  },
  "use-boolean": {
    demo: UseBooleanDocDemo,
    usage: `
import { useBoolean } from "hookli";

export function Demo() {
  const { value, setTrue, setFalse, toggle } = useBoolean(false);

  return (
    <div>
      <p>{value ? "On" : "Off"}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={setTrue}>On</button>
      <button onClick={setFalse}>Off</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "defaultValue",
        type: "boolean",
        defaultValue: "false",
        description: "The value the boolean starts from.",
      },
    ],
    returns: [
      {
        name: "value",
        type: "boolean",
        description: "The current boolean value.",
      },
      {
        name: "setValue",
        type: "(value: boolean) => void",
        description: "Sets the value directly.",
      },
      {
        name: "setTrue",
        type: "() => void",
        description: "Sets the value to true.",
      },
      {
        name: "setFalse",
        type: "() => void",
        description: "Sets the value to false.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Flips the value.",
      },
    ],
  },
  "use-counter": {
    demo: UseCounterDocDemo,
    usage: `
import { useCounter } from "hookli";

export function Demo() {
  const { count, increment, decrement, reset, setCount } = useCounter(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
      <button onClick={() => setCount(10)}>Set 10</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialValue",
        type: "number",
        defaultValue: "0",
        description: "The count the hook starts from; reset returns here.",
      },
    ],
    returns: [
      {
        name: "count",
        type: "number",
        description: "The current count.",
      },
      {
        name: "increment",
        type: "() => void",
        description: "Adds one to the count.",
      },
      {
        name: "decrement",
        type: "() => void",
        description: "Subtracts one from the count.",
      },
      {
        name: "reset",
        type: "() => void",
        description: "Restores the count to initialValue.",
      },
      {
        name: "setCount",
        type: "Dispatch<SetStateAction<number>>",
        description: "Sets the count directly; accepts a value or an updater function.",
      },
    ],
  },
  "use-step": {
    demo: UseStepDocDemo,
    usage: `
import { useStep } from "hookli";

export function Demo() {
  const [step, { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, reset }] =
    useStep(4);

  return (
    <div>
      <p>Step {step} of 4</p>
      <button onClick={goToPrevStep} disabled={!canGoToPrevStep}>Back</button>
      <button onClick={goToNextStep} disabled={!canGoToNextStep}>Next</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "maxStep",
        type: "number",
        description: "The highest reachable step (inclusive). Steps run from 1 to maxStep.",
      },
    ],
    returns: [
      {
        name: "[0] step",
        type: "number",
        description: "The current step, 1-indexed.",
      },
      {
        name: "[1] actions",
        type: "UseStepActions",
        description: "Controls for moving between steps — see below.",
      },
    ],
    typeAliases: [
      {
        name: "UseStepActions",
        description: "The second tuple element — the stepper controls.",
        rows: [
          {
            name: "goToNextStep",
            type: "() => void",
            description: "Advances to the next step; a no-op at maxStep.",
          },
          {
            name: "goToPrevStep",
            type: "() => void",
            description: "Goes back one step; a no-op at step 1.",
          },
          {
            name: "reset",
            type: "() => void",
            description: "Resets back to step 1.",
          },
          {
            name: "canGoToNextStep",
            type: "boolean",
            description: "Whether a next step is available.",
          },
          {
            name: "canGoToPrevStep",
            type: "boolean",
            description: "Whether a previous step is available.",
          },
          {
            name: "setStep",
            type: "Dispatch<SetStateAction<number>>",
            description: "Sets the step directly (1-indexed); throws if outside the 1..maxStep range.",
          },
        ],
      },
    ],
  },
  "use-countdown": {
    demo: UseCountdownDocDemo,
    usage: `
import { useCountdown } from "hookli";

export function Demo() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: 10,
    intervalMs: 1000,
  });

  return (
    <div>
      <p>{count}</p>
      <button onClick={startCountdown}>Start</button>
      <button onClick={stopCountdown}>Pause</button>
      <button onClick={resetCountdown}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UseCountdownOptions",
        description: "Configures the timer — start value, tick interval, direction and stop value. See below.",
      },
    ],
    returns: [
      {
        name: "[0] count",
        type: "number",
        description: "The current count. Ticks by ±1 every intervalMs while running.",
      },
      {
        name: "[1] actions",
        type: "UseCountdownActions",
        description: "Start, pause and reset controls — see below.",
      },
    ],
    typeAliases: [
      {
        name: "UseCountdownOptions",
        description: "The single options argument.",
        rows: [
          {
            name: "countStart",
            type: "number",
            description: "The value the countdown starts from.",
          },
          {
            name: "intervalMs",
            type: "number",
            description: "Milliseconds between ticks. Defaults to 1000.",
          },
          {
            name: "isIncrement",
            type: "boolean",
            description: "Count up instead of down. Defaults to false.",
          },
          {
            name: "countStop",
            type: "number",
            description: "The value at which the timer stops itself. Defaults to 0.",
          },
        ],
      },
      {
        name: "UseCountdownActions",
        description: "The second tuple element — the timer controls.",
        rows: [
          {
            name: "startCountdown",
            type: "() => void",
            description: "Starts (or resumes) the timer.",
          },
          {
            name: "stopCountdown",
            type: "() => void",
            description: "Pauses the timer without resetting the count.",
          },
          {
            name: "resetCountdown",
            type: "() => void",
            description: "Stops the timer and resets the count to countStart.",
          },
        ],
      },
    ],
  },
  "use-map": {
    demo: UseMapDocDemo,
    usage: `
import { useMap } from "hookli";

export function Demo() {
  const [map, { set, remove, reset }] = useMap<string, string>([
    ["theme", "dark"],
  ]);

  return (
    <div>
      <button onClick={() => set("lang", "en")}>Set lang</button>
      <button onClick={() => remove("theme")}>Remove theme</button>
      <button onClick={reset}>Reset</button>
      <ul>
        {[...map.entries()].map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialState",
        type: "MapOrEntries<K, V>",
        defaultValue: "new Map()",
        description: "Initial entries as a Map or an array of [key, value] pairs.",
      },
    ],
    returns: [
      {
        name: "[0] map",
        type: "ReadOnlyMap<K, V>",
        description: "A read-only view of the map — the mutating set/clear/delete methods are omitted; use the actions instead. get, has, size and iteration remain.",
      },
      {
        name: "[1] actions",
        type: "UseMapActions<K, V>",
        description: "Stable helpers that replace the map with a fresh copy so React re-renders — see below.",
      },
    ],
    typeAliases: [
      {
        name: "UseMapActions",
        description: "The second tuple element — the map mutation helpers.",
        rows: [
          {
            name: "set",
            type: "(key: K, value: V) => void",
            description: "Adds or updates one entry.",
          },
          {
            name: "setAll",
            type: "(entries: MapOrEntries<K, V>) => void",
            description: "Replaces every entry with the given Map or [key, value] pairs.",
          },
          {
            name: "remove",
            type: "(key: K) => void",
            description: "Deletes the entry for the given key.",
          },
          {
            name: "reset",
            type: "() => void",
            description: "Empties the map.",
          },
        ],
      },
    ],
  },
  "use-default-value": {
    demo: UseDefaultValueDocDemo,
    usage: `
import { useDefaultValue } from "hookli";

export function Demo() {
  const [value, setValue] = useDefaultValue<string>(null, "default");

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue("new value")}>Set new value</button>
      <button onClick={() => setValue(undefined)}>Set undefined</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialValue",
        type: "T | null | undefined",
        description: "The initial value. If nullish, the defaultValue is returned.",
      },
      {
        name: "defaultValue",
        type: "T",
        description: "The value returned when the initial value is nullish.",
      },
    ],
    returns: [
      {
        name: "[0] value",
        type: "T",
        description: "The current value.",
      },
      {
        name: "[1] setValue",
        type: "(value: T | null | undefined) => void",
        description: "Sets the value.",
      },
    ],
  },
  "use-click-outside": {
    demo: UseClickOutsideDocDemo,
    usage: `
import { useRef, useState } from "react";
import { useClickOutside } from "hookli";

export function Demo() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div ref={menuRef}>
      <button onClick={() => setOpen((prev) => !prev)}>Actions</button>
      {open && (
        <ul role="menu">
          <li>Rename</li>
          <li>Duplicate</li>
        </ul>
      )}
    </div>
  );
}
`,
    parameters: [
      {
        name: "ref",
        type: "RefObject<T>",
        description: "Ref attached to the element that counts as inside — clicks within it (or its children) never fire the callback.",
      },
      {
        name: "callback",
        type: "() => void",
        description: "Called on every mousedown outside the ref'd element — even while your UI is closed, so guard inside the callback if needed.",
      },
    ],
    returns: [],
  },
  "use-mouse-position": {
    demo: UseMousePositionDocDemo,
    usage: `
import { useRef } from "react";
import { useMousePosition } from "hookli";

export function Demo() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(panelRef);

  return (
    <div ref={panelRef} style={{ height: 160 }}>
      {x === null || y === null ? (
        <p>Move your cursor</p>
      ) : (
        <p>
          {Math.round(x)} × {Math.round(y)}
        </p>
      )}
    </div>
  );
}
`,
    parameters: [
      {
        name: "ref",
        type: "RefObject<T>",
        description: "Ref attached to the element the coordinates are measured against.",
      },
    ],
    returns: [
      {
        name: "x",
        type: "number | null",
        description: "Cursor X relative to the element's left edge; null until the first mousemove. Updates on every window mousemove, so it can go negative or exceed the element's width.",
      },
      {
        name: "y",
        type: "number | null",
        description: "Cursor Y relative to the element's top edge; null until the first mousemove.",
      },
    ],
  },
  "use-infinite-scroll": {
    demo: UseInfiniteScrollDocDemo,
    usage: `
import { useCallback, useState } from "react";
import { useInfiniteScroll } from "hookli";

const page = (start: number) =>
  Array.from({ length: 10 }, (_, i) => \`Item \${start + i + 1}\`);

export function Demo() {
  const [items, setItems] = useState(() => page(0));

  const fetchMoreData = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setItems((prev) => [...prev, ...page(prev.length)]);
        resolve();
      }),
    [],
  );

  const isFetching = useInfiniteScroll(fetchMoreData);

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {isFetching && <p>Loading more…</p>}
    </div>
  );
}
`,
    parameters: [
      {
        name: "fetchMoreData",
        type: "() => Promise<void>",
        description: "Called when the window scroll comes within 500px of the document bottom. Must return a promise — the hook stays in the fetching state until it resolves.",
      },
    ],
    returns: [
      {
        name: "isFetching",
        type: "boolean",
        description: "True while a triggered fetchMoreData promise is pending; blocks re-triggering until it resolves.",
      },
    ],
  },
  "use-expandable-text": {
    demo: UseExpandableTextDocDemo,
    usage: `
import { useExpandableText } from "hookli";

export function Review({ body }: { body: string }) {
  const { text, isExpanded, isTruncated, toggle, ref, clampStyle } =
    useExpandableText<HTMLParagraphElement>(body, { maxChars: 180, maxLines: 3 });

  return (
    <div>
      <p ref={ref} style={clampStyle}>{text}</p>
      {isTruncated && (
        <button onClick={toggle}>{isExpanded ? "Show less" : "Show more"}</button>
      )}
    </div>
  );
}
`,
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The full text to (maybe) collapse.",
      },
      {
        name: "options",
        type: "UseExpandableTextOptions",
        defaultValue: "{}",
        description: "Character and/or line budgets and display options. Whichever limit clips first wins.",
      },
    ],
    returns: [
      {
        name: "text",
        type: "string",
        description: "The text to render — character-capped when collapsed and maxChars is set, otherwise the full text.",
      },
      {
        name: "isExpanded",
        type: "boolean",
        description: "Whether the full text is currently shown.",
      },
      {
        name: "isTruncated",
        type: "boolean",
        description: "True when either limit actually clips the text — use it to hide the toggle when the text fits.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Flip between expanded and collapsed.",
      },
      {
        name: "expand",
        type: "() => void",
        description: "Show the full text.",
      },
      {
        name: "collapse",
        type: "() => void",
        description: "Collapse back to the limit.",
      },
      {
        name: "ref",
        type: "RefCallback<T>",
        description: "Attach to the text element. Required for the maxLines clamp and its overflow measurement.",
      },
      {
        name: "clampStyle",
        type: "CSSProperties",
        description: "Spread onto the text element; applies the CSS line-clamp while collapsed and maxLines is set.",
      },
    ],
    typeAliases: [
      {
        name: "UseExpandableTextOptions",
        description: "Character and line budgets — provide either, or both.",
        rows: [
          {
            name: "maxChars",
            type: "number",
            description: "Max characters shown while collapsed. Pure string logic (SSR-safe), trimmed to a word boundary.",
          },
          {
            name: "maxLines",
            type: "number",
            description: "Max lines shown while collapsed. Applied as a CSS line-clamp and measured in the DOM, so it re-clips on resize.",
          },
          {
            name: "ellipsis",
            type: "string",
            defaultValue: '"…"',
            description: "Appended to character-truncated text.",
          },
          {
            name: "defaultExpanded",
            type: "boolean",
            defaultValue: "false",
            description: "Whether the text starts expanded.",
          },
        ],
      },
    ],
  },
  "use-hover": {
    demo: UseHoverDocDemo,
    usage: `
import { useRef } from "react";
import { useHover } from "hookli";

export function Demo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(boxRef);

  return (
    <div ref={boxRef}>
      {isHovered ? "Pointer is over me" : "Hover this panel"}
    </div>
  );
}
`,
    parameters: [
      {
        name: "elementRef",
        type: "RefObject<T>",
        description: "Ref to the element whose hover state to track. mouseenter/mouseleave are attached to it and cleaned up automatically.",
      },
    ],
    returns: [
      {
        name: "isHovered",
        type: "boolean",
        description: "True while the pointer is over the element, false otherwise. Starts false on the server and until the first mouseenter.",
      },
    ],
  },
  "use-intersection-observer": {
    demo: UseIntersectionObserverDocDemo,
    usage: `
import { useIntersectionObserver } from "hookli";

export function Demo() {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
  });

  return (
    <div ref={ref}>
      {isIntersecting ? "In view" : "Scroll me into view"}
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UseIntersectionObserverOptions",
        defaultValue: "{}",
        description: "Observer thresholds, root, and behaviour flags. All optional.",
      },
    ],
    returns: [
      {
        name: "ref",
        type: "(node: Element | null) => void",
        description: "Ref callback to attach to the element you want to observe.",
      },
      {
        name: "isIntersecting",
        type: "boolean",
        description: "Whether the observed element currently intersects the root.",
      },
      {
        name: "entry",
        type: "IntersectionObserverEntry | null",
        description: "The most recent observer entry (intersectionRatio, boundingClientRect…), or null before the first report.",
      },
    ],
    typeAliases: [
      {
        name: "UseIntersectionObserverOptions",
        description: "Configures the underlying IntersectionObserver.",
        rows: [
          {
            name: "threshold",
            type: "number | number[]",
            defaultValue: "0",
            description: "One or more visibility ratios at which to fire.",
          },
          {
            name: "root",
            type: "Element | Document | null",
            defaultValue: "null",
            description: "The element used as the viewport. Defaults to the browser viewport.",
          },
          {
            name: "rootMargin",
            type: "string",
            defaultValue: '"0%"',
            description: "Margin around the root, in CSS-margin syntax — grows or shrinks the trigger area.",
          },
          {
            name: "freezeOnceVisible",
            type: "boolean",
            defaultValue: "false",
            description: "Once the target is visible, stop observing and keep the visible state.",
          },
          {
            name: "initialIsIntersecting",
            type: "boolean",
            defaultValue: "false",
            description: "isIntersecting value used before the observer first reports.",
          },
          {
            name: "onChange",
            type: "(isIntersecting: boolean, entry: IntersectionObserverEntry) => void",
            description: "Called with the latest entry whenever intersection changes.",
          },
        ],
      },
      {
        name: "UseIntersectionObserverReturn",
        description: "The ref callback plus the current intersection state.",
        rows: [
          {
            name: "ref",
            type: "(node: Element | null) => void",
            description: "Attach to the element you want to observe.",
          },
          {
            name: "isIntersecting",
            type: "boolean",
            description: "Whether the target currently intersects the root.",
          },
          {
            name: "entry",
            type: "IntersectionObserverEntry | null",
            description: "The most recent observer entry, or null before the first report.",
          },
        ],
      },
    ],
  },
  "use-resize-observer": {
    demo: UseResizeObserverDocDemo,
    usage: `
import { useRef } from "react";
import { useResizeObserver } from "hookli";

export function Demo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver(boxRef);

  return (
    <div ref={boxRef}>
      {width === undefined ? "Measuring…" : \`\${Math.round(width)} × \${Math.round(height ?? 0)}\`}
    </div>
  );
}
`,
    parameters: [
      {
        name: "ref",
        type: "RefObject<T>",
        description: "Ref to the element to measure. The observer attaches to ref.current.",
      },
      {
        name: "options",
        type: "UseResizeObserverOptions",
        defaultValue: "{}",
        description: "Which box to measure and an optional resize callback.",
      },
    ],
    returns: [
      {
        name: "width",
        type: "number | undefined",
        description: "The element's measured width; undefined until the first observed layout.",
      },
      {
        name: "height",
        type: "number | undefined",
        description: "The element's measured height; undefined until the first observed layout.",
      },
    ],
    typeAliases: [
      {
        name: "UseResizeObserverOptions",
        description: "Configures the underlying ResizeObserver.",
        rows: [
          {
            name: "box",
            type: "ResizeObserverBoxOptions",
            defaultValue: '"content-box"',
            description: "Which box model to measure: content-box, border-box or device-pixel-content-box.",
          },
          {
            name: "onResize",
            type: "(size: ResizeObserverSize) => void",
            description: "Called with the freshly measured size on every resize.",
          },
        ],
      },
      {
        name: "ResizeObserverSize",
        description: "The size the hook returns; both values are undefined until the first measurement.",
        rows: [
          {
            name: "width",
            type: "number | undefined",
            description: "Measured width in pixels.",
          },
          {
            name: "height",
            type: "number | undefined",
            description: "Measured height in pixels.",
          },
        ],
      },
    ],
  },
  "use-scroll-lock": {
    demo: UseScrollLockDocDemo,
    usage: `
import { useScrollLock } from "hookli";

export function Modal({ onClose }: { onClose: () => void }) {
  // Locks <body> scroll on mount, restores it on unmount.
  useScrollLock();

  return (
    <div role="dialog" onClick={onClose}>
      Scrolling behind this modal is frozen.
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UseScrollLockOptions",
        defaultValue: "{}",
        description: "Auto-lock behaviour, the lock target, and scrollbar compensation.",
      },
    ],
    returns: [
      {
        name: "isLocked",
        type: "boolean",
        description: "Whether the target's scroll is currently locked.",
      },
      {
        name: "lock",
        type: "() => void",
        description: "Lock the target's scroll (sets overflow: hidden, optionally padding-compensated).",
      },
      {
        name: "unlock",
        type: "() => void",
        description: "Restore the target's original scroll behaviour.",
      },
    ],
    typeAliases: [
      {
        name: "UseScrollLockOptions",
        description: "Controls what is locked and when.",
        rows: [
          {
            name: "autoLock",
            type: "boolean",
            defaultValue: "true",
            description: "Lock automatically on mount and restore on unmount.",
          },
          {
            name: "lockTarget",
            type: "HTMLElement | string",
            defaultValue: "<body>",
            description: "Element (or CSS selector) whose scroll to lock. Defaults to the document body.",
          },
          {
            name: "widthReflow",
            type: "boolean",
            defaultValue: "true",
            description: "Compensate for the removed scrollbar with padding so the layout does not shift.",
          },
        ],
      },
      {
        name: "UseScrollLockReturn",
        description: "The current lock state plus manual controls.",
        rows: [
          {
            name: "isLocked",
            type: "boolean",
            description: "Whether the target's scroll is currently locked.",
          },
          {
            name: "lock",
            type: "() => void",
            description: "Lock the target's scroll.",
          },
          {
            name: "unlock",
            type: "() => void",
            description: "Restore the target's original scroll behaviour.",
          },
        ],
      },
    ],
  },
  "use-click-any-where": {
    demo: UseClickAnyWhereDocDemo,
    usage: `
import { useState } from "react";
import { useClickAnyWhere } from "hookli";

export function Demo() {
  const [clicks, setClicks] = useState(0);

  useClickAnyWhere(() => setClicks((prev) => prev + 1));

  return <p>Document clicks: {clicks}</p>;
}
`,
    parameters: [
      {
        name: "handler",
        type: "(event: MouseEvent) => void",
        description: "Called with the MouseEvent on every document-wide click. The latest handler is always used — no stale closure.",
      },
    ],
    returns: [],
  },
  "use-media-query": {
    demo: UseMediaQueryDocDemo,
    usage: `
import { useMediaQuery } from "hookli";

export function Demo() {
  const isWide = useMediaQuery("(min-width: 768px)");

  return <p>{isWide ? "Desktop layout" : "Mobile layout"}</p>;
}
`,
    parameters: [
      {
        name: "query",
        type: "string",
        description: 'A CSS media query string, e.g. "(min-width: 768px)" or "(prefers-color-scheme: dark)".',
      },
      {
        name: "options",
        type: "UseMediaQueryOptions",
        defaultValue: "{}",
        description: "SSR default and hydration behaviour. Optional.",
      },
    ],
    returns: [
      {
        name: "matches",
        type: "boolean",
        description: "Whether the query currently matches. Re-renders on every matchMedia change event, and starts from defaultValue on the server.",
      },
    ],
    typeAliases: [
      {
        name: "UseMediaQueryOptions",
        description: "Configures the server value and mount behaviour.",
        rows: [
          {
            name: "defaultValue",
            type: "boolean",
            defaultValue: "false",
            description: "Value returned on the server and before hydration.",
          },
          {
            name: "initializeWithValue",
            type: "boolean",
            defaultValue: "true",
            description: "Read the real match synchronously on mount. Set false to always start from defaultValue and avoid a hydration mismatch.",
          },
        ],
      },
    ],
  },
  "use-screen": {
    demo: UseScreenDocDemo,
    usage: `
import { useScreen } from "hookli";

export function Demo() {
  const screen = useScreen();

  return <p>Screen: {screen ? \`\${screen.width}×\${screen.height}\` : "…"}</p>;
}
`,
    parameters: [
      {
        name: "options",
        type: "UseScreenOptions",
        defaultValue: "{}",
        description: "Hydration behaviour. Optional.",
      },
    ],
    returns: [
      {
        name: "screen",
        type: "Screen | null",
        description: "The current window.screen (width, height, availWidth, colorDepth, orientation…), refreshed on every resize. null on the server and until hydration.",
      },
    ],
    typeAliases: [
      {
        name: "UseScreenOptions",
        description: "Configures mount behaviour.",
        rows: [
          {
            name: "initializeWithValue",
            type: "boolean",
            defaultValue: "true",
            description: "Read the real screen synchronously on mount. Set false to start as null and populate after hydration.",
          },
        ],
      },
    ],
  },
  "use-window-size": {
    demo: UseWindowSizeDocDemo,
    usage: `
import { useWindowSize } from "hookli";

export function Demo() {
  const { width, height } = useWindowSize();

  return <p>{width} × {height}</p>;
}
`,
    parameters: [
      {
        name: "options",
        type: "UseWindowSizeOptions",
        defaultValue: "{}",
        description: "Hydration behaviour. Optional.",
      },
    ],
    returns: [
      {
        name: "width",
        type: "number",
        description: "The viewport's inner width in pixels. 0 on the server and until hydration.",
      },
      {
        name: "height",
        type: "number",
        description: "The viewport's inner height in pixels. 0 on the server and until hydration.",
      },
    ],
    typeAliases: [
      {
        name: "WindowSize",
        description: "The viewport size reported by useWindowSize.",
        rows: [
          {
            name: "width",
            type: "number",
            description: "The viewport's inner width in pixels.",
          },
          {
            name: "height",
            type: "number",
            description: "The viewport's inner height in pixels.",
          },
        ],
      },
      {
        name: "UseWindowSizeOptions",
        description: "Configures mount behaviour.",
        rows: [
          {
            name: "initializeWithValue",
            type: "boolean",
            defaultValue: "true",
            description: "Read the real size synchronously on mount. Set false to start at 0 and populate after hydration.",
          },
        ],
      },
    ],
  },
  "use-copy-to-clipboard": {
    demo: UseCopyToClipboardDocDemo,
    usage: `
import { useCopyToClipboard } from "hookli";

export function Demo() {
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <button type="button" onClick={() => copy("npm i hookli")}>
      {copiedText ? "Copied!" : "Copy"}
    </button>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "[0] copiedText",
        type: "CopiedValue",
        description: "The last successfully-copied string, or null before any copy or after a failed one.",
      },
      {
        name: "[1] copy",
        type: "CopyFn",
        description: "Writes text to the clipboard. Resolves true on success, false when the API is unavailable or the write is rejected.",
      },
    ],
    typeAliases: [
      {
        name: "CopiedValue",
        rows: [
          {
            name: "value",
            type: "string | null",
            description: "The tracked copied text, or null.",
          },
        ],
      },
      {
        name: "CopyFn",
        rows: [
          {
            name: "value",
            type: "(text: string) => Promise<boolean>",
            description: "Copies text and reports whether the write succeeded.",
          },
        ],
      },
    ],
  },
  "use-script": {
    demo: UseScriptDocDemo,
    usage: `
import { useScript } from "hookli";

export function Demo() {
  const status = useScript("https://example.com/widget.js");

  if (status === "ready") return <p>Widget loaded.</p>;
  return <p>Loading… ({status})</p>;
}
`,
    parameters: [
      {
        name: "src",
        type: "string | null",
        description: "The script URL to load, or null to skip loading and stay idle.",
      },
      {
        name: "options",
        type: "UseScriptOptions",
        defaultValue: "{}",
        description: "Optional shouldPreventLoad and removeOnUnmount flags.",
      },
    ],
    returns: [
      {
        name: "status",
        type: "UseScriptStatus",
        description: 'The current load status: "idle" | "loading" | "ready" | "error".',
      },
    ],
    typeAliases: [
      {
        name: "UseScriptStatus",
        rows: [
          {
            name: "value",
            type: '"idle" | "loading" | "ready" | "error"',
            description: "Lifecycle of the injected script tag.",
          },
        ],
      },
      SCRIPT_OPTIONS_ALIAS,
    ],
  },
  "use-fetch": {
    demo: UseFetchDocDemo,
    usage: `
import { useFetch } from "hookli";

type Post = { id: number; title: string; body: string };

export function Demo() {
  const { data, loading, error } = useFetch<Post>(
    "https://jsonplaceholder.typicode.com/posts/1",
  );

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Request failed: {error.message}</p>;

  return <article>{data?.title}</article>;
}
`,
    parameters: [
      {
        name: "url",
        type: "string",
        description: "The endpoint to GET. The request starts on mount and re-runs whenever the url changes.",
      },
    ],
    returns: [
      {
        name: "data",
        type: "T | null",
        description: "The parsed JSON body; null until the first request succeeds. Kept from the previous url while a refetch is in flight.",
      },
      {
        name: "error",
        type: "Error | null",
        description: 'Set on network failure or a non-ok response ("HTTP error! status: 404"). Never cleared by later requests — remount the component (e.g. key={url}) for fresh state.',
      },
      {
        name: "loading",
        type: "boolean",
        description: "True until the first request settles. Not reset to true when the url changes — remount for a per-request loading flag.",
      },
    ],
  },
  "use-geo-location": {
    demo: UseGeoLocationDocDemo,
    usage: `
import { useState } from "react";
import { useGeoLocation } from "hookli";

function Coordinates() {
  const { location, error } = useGeoLocation();

  if (error) return <p>{error.message}</p>;
  if (!location) return <p>Locating…</p>;

  const { latitude, longitude } = location.coords;
  return <p>{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>;
}

export function Demo() {
  const [asked, setAsked] = useState(false);

  // The hook may prompt for permission as soon as it mounts —
  // keep it unmounted until a user gesture.
  if (!asked) {
    return <button onClick={() => setAsked(true)}>Where am I?</button>;
  }
  return <Coordinates />;
}
`,
    parameters: [],
    returns: [
      {
        name: "location",
        type: "GeolocationPosition | null",
        description: "hookli's trimmed position type — just coords.latitude and coords.longitude. Null until the first reading arrives.",
      },
      {
        name: "error",
        type: "GeolocationError | Error | null",
        description: "Permission denials, unsupported browsers and failed lookups all land here — read .message for display. Requesting starts on mount, so mount the hook behind a user gesture.",
      },
    ],
    typeAliases: [
      {
        name: "GeolocationPosition",
        description: "hookli's trimmed reading — only the coordinates, not the full browser GeolocationPosition.",
        rows: [
          {
            name: "coords.latitude",
            type: "number",
            description: "Latitude in decimal degrees.",
          },
          {
            name: "coords.longitude",
            type: "number",
            description: "Longitude in decimal degrees.",
          },
        ],
      },
      {
        name: "GeolocationError",
        description: "Shape of a permission or lookup failure.",
        rows: [
          {
            name: "code",
            type: "number",
            description: "Numeric error code mirrored from the browser's GeolocationPositionError.",
          },
          {
            name: "message",
            type: "string",
            description: "Human-readable reason for the failure.",
          },
        ],
      },
    ],
  },
  "use-draggable": {
    demo: UseDraggableDocDemo,
    usage: `
import { useDraggable } from "hookli";

export function Demo() {
  const { ref, containerRef, position, isDragging } = useDraggable<
    HTMLDivElement,
    HTMLDivElement
  >({
    unit: "ratio",
    bounds: "parent",
    initialPosition: { x: 0.5, y: 0.5 },
    jumpOnClick: true,
  });

  return (
    <div ref={containerRef} style={{ position: "relative", height: 224 }}>
      <div
        ref={ref}
        tabIndex={0}
        aria-label="Draggable puck"
        style={{ position: "absolute", top: 0, left: 0, width: 44, height: 44 }}
      >
        {isDragging ? "●" : "○"}
      </div>
      <p>
        {(position.x * 100).toFixed(1)}% × {(position.y * 100).toFixed(1)}%
      </p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UseDraggableOptions",
        defaultValue: "{}",
        description: "Every option is optional. See the UseDraggableOptions table below.",
      },
    ],
    returns: [
      {
        name: "ref",
        type: "(node: T | null) => void",
        description: "Callback ref for the draggable element. The hook moves it with transform: translate3d(), so layout is untouched.",
      },
      {
        name: "containerRef",
        type: "(node: C | null) => void",
        description: "Callback ref for the canvas that jumpOnClick listens on.",
      },
      {
        name: "position",
        type: "Position",
        description: "The current position in unit. In controlled mode it is the position prop.",
      },
      {
        name: "isDragging",
        type: "boolean",
        description: "true while a pointer drag is in progress.",
      },
      {
        name: "moveTo",
        type: "(position: Position, options?: { animate?: boolean }) => void",
        description: "Move programmatically. Bounds and grid still apply; in controlled mode it calls onChange instead.",
      },
      {
        name: "reset",
        type: "() => void",
        description: "Move back to initialPosition.",
      },
    ],
    typeAliases: [
      {
        name: "UseDraggableOptions",
        description: "Pass position + onChange for controlled use, or initialPosition for uncontrolled.",
        rows: [
          {
            name: "unit",
            type: '"px" | "ratio"',
            defaultValue: '"px"',
            description: "px: translate offset from the layout spot. ratio: where the anchor point sits in the bounds box, 0..1 per axis, so it survives resizes. Needs element bounds.",
          },
          {
            name: "position",
            type: "Position",
            description: "Controlled position. Input calls onChange; the element moves only when this prop changes.",
          },
          {
            name: "initialPosition",
            type: "Position",
            defaultValue: "{ x: 0, y: 0 }",
            description: "Uncontrolled starting position.",
          },
          {
            name: "onChange",
            type: "(position: Position) => void",
            description: "Called when a drag, jump, arrow key or moveTo produces a new position. Not called for prop changes or resize re-clamps.",
          },
          {
            name: "bounds",
            type: '"parent" | RefObject<HTMLElement> | { left?, top?, right?, bottom? }',
            description: "Keep the element inside a box. Element bounds are live: re-measured on every gesture and on resize.",
          },
          {
            name: "axis",
            type: '"x" | "y" | "both"',
            defaultValue: '"both"',
            description: "Restrict movement to one axis.",
          },
          {
            name: "grid",
            type: "[number, number]",
            description: "Snap the translate offset to a px grid.",
          },
          {
            name: "jumpOnClick",
            type: "boolean",
            defaultValue: "false",
            description: "Pressing an empty spot of the container jumps the element there; holding keeps dragging.",
          },
          {
            name: "anchor",
            type: '"center" | "top-left"',
            defaultValue: '"center"',
            description: "The element point that lands on the pointer when jumping, and that a ratio position describes.",
          },
          {
            name: "transition",
            type: "number",
            defaultValue: "200",
            description: "Jump animation length in ms; 0 snaps instantly.",
          },
          {
            name: "smoothing",
            type: "number",
            defaultValue: "0.3",
            description: "How softly the element trails the pointer, from 0 (glued) to just under 1 (floaty). Reduced motion turns it off.",
          },
          {
            name: "keyboardStep",
            type: "number | false",
            defaultValue: "10",
            description: "Arrow-key step in px when the element is focused; the grid step wins when grid is set.",
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: "Ignore pointer and keyboard input. moveTo still works.",
          },
          {
            name: "onDragStart / onDrag / onDragEnd / onJump",
            type: "(position: Position) => void",
            description: "Gesture callbacks, in unit. onDragEnd also fires after each keyboard move.",
          },
        ],
      },
      {
        name: "Position",
        description: "A point in the chosen unit.",
        rows: [
          { name: "x", type: "number", description: "Horizontal: px offset, or 0..1 of the bounds box width." },
          { name: "y", type: "number", description: "Vertical: px offset, or 0..1 of the bounds box height." },
        ],
      },
    ],
  },
  "use-previous": {
    demo: UsePreviousDocDemo,
    usage: `
import { useState } from "react";
import { usePrevious } from "hookli";

export function Demo() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount ?? "(none)"}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "value",
        type: "T",
        description: "The value to track across renders.",
      },
    ],
    returns: [
      {
        name: "previousValue",
        type: "T | undefined",
        description: "The value from the previous render (undefined on first render).",
      },
    ],
  },
  "use-list": {
    demo: UseListDocDemo,
    usage: `
import { useList } from "hookli";

export function Demo() {
  const [list, { push, removeAt, clear, reset }] = useList<string>(["apple", "banana"]);

  return (
    <div>
      <p>Items: {list.join(", ")}</p>
      <button onClick={() => push("cherry")}>Push item</button>
      <button onClick={() => removeAt(list.length - 1)}>Pop item</button>
      <button onClick={clear}>Clear</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initial",
        type: "T[]",
        defaultValue: "[]",
        description: "The initial array state.",
      },
    ],
    returns: [
      {
        name: "[0] list",
        type: "T[]",
        description: "The current array state.",
      },
      {
        name: "[1] actions",
        type: "UseListActions<T>",
        description: "Immutable manipulation actions (push, insertAt, updateAt, removeAt, clear, reset).",
      },
    ],
    typeAliases: [USE_LIST_ACTIONS_ALIAS],
  },
  "use-set": {
    demo: UseSetDocDemo,
    usage: `
import { useSet } from "hookli";

export function Demo() {
  const [set, { add, remove, toggle, clear, reset }] = useSet<string>(["react"]);

  return (
    <div>
      <p>Selected: {Array.from(set).join(", ")}</p>
      <button onClick={() => toggle("typescript")}>Toggle typescript</button>
      <button onClick={() => add("nextjs")}>Add nextjs</button>
      <button onClick={() => remove("react")}>Remove react</button>
      <button onClick={clear}>Clear</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initial",
        type: "Iterable<T>",
        defaultValue: "empty",
        description: "Optional initial values to populate the Set with.",
      },
    ],
    returns: [
      {
        name: "[0] set",
        type: "Set<T>",
        description: "The current Set state.",
      },
      {
        name: "[1] actions",
        type: "UseSetActions<T>",
        description: "Immutable set manipulation actions (add, remove, toggle, has, clear, reset).",
      },
    ],
    typeAliases: [USE_SET_ACTIONS_ALIAS],
  },
  "use-queue": {
    demo: UseQueueDocDemo,
    usage: `
import { useQueue } from "hookli";

export function Demo() {
  const { queue, add, remove, clear, first, last, size } = useQueue<string>(["first", "second"]);

  return (
    <div>
      <p>Queue: {queue.join(" -> ")}</p>
      <p>Head: {first ?? "(none)"} | Size: {size}</p>
      <button onClick={() => add("new-task")}>Enqueue</button>
      <button onClick={() => remove()}>Dequeue</button>
      <button onClick={clear}>Clear</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initial",
        type: "T[]",
        defaultValue: "[]",
        description: "Initial items for the queue.",
      },
    ],
    returns: [
      {
        name: "queueReturn",
        type: "UseQueueReturn<T>",
        description: "Object containing queue state and actions (queue, add, remove, clear, first, last, size).",
      },
    ],
    typeAliases: [USE_QUEUE_RETURN_ALIAS],
  },
  "use-raf-state": {
    demo: UseRafStateDocDemo,
    usage: `
import { useRafState } from "hookli";

export function Demo() {
  const [pos, setPos] = useRafState({ x: 0, y: 0 });

  return (
    <div
      onPointerMove={(e) => {
        setPos({ x: e.clientX, y: e.clientY });
      }}
    >
      <p>Position: {pos.x}, {pos.y}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialState",
        type: "T | (() => T)",
        description: "The initial state or lazy initializer function.",
      },
    ],
    returns: [
      {
        name: "[0] state",
        type: "T",
        description: "The current state value.",
      },
      {
        name: "[1] setState",
        type: "Dispatch<SetStateAction<T>>",
        description: "State setter whose updates are batched to requestAnimationFrame.",
      },
    ],
  },
  "use-throttle": {
    demo: UseThrottleDocDemo,
    usage: `
import { useState } from "react";
import { useThrottle } from "hookli";

export function Demo() {
  const [query, setQuery] = useState("");
  const throttledQuery = useThrottle(query, 500);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <p>Instant: {query}</p>
      <p>Throttled: {throttledQuery}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "value",
        type: "T",
        description: "The value to throttle.",
      },
      {
        name: "interval",
        type: "number",
        defaultValue: "500",
        description: "Minimum interval in milliseconds between updates.",
      },
    ],
    returns: [
      {
        name: "throttledValue",
        type: "T",
        description: "The throttled value, updated at most once per interval.",
      },
    ],
  },
  "use-update-effect": {
    demo: UseUpdateEffectDocDemo,
    usage: `
import { useState } from "react";
import { useUpdateEffect } from "hookli";

export function Demo() {
  const [count, setCount] = useState(0);

  useUpdateEffect(() => {
    console.log("Count changed to:", count);
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "effect",
        type: "EffectCallback",
        description: "Effect callback to execute on updates. Skips initial mount.",
      },
      {
        name: "deps",
        type: "DependencyList",
        defaultValue: "undefined",
        description: "Dependency list triggering the effect on change.",
      },
    ],
    returns: [
      {
        name: "void",
        type: "void",
        description: "Returns nothing.",
      },
    ],
  },
  "use-effect-once": {
    demo: UseEffectOnceDocDemo,
    usage: `
import { useEffectOnce } from "hookli";

export function Demo() {
  useEffectOnce(() => {
    console.log("Component mounted exactly once");

    return () => {
      console.log("Component unmounted");
    };
  });

  return <div>Mounted</div>;
}
`,
    parameters: [
      {
        name: "effect",
        type: "EffectCallback",
        description: "Effect callback executed only once on initial mount.",
      },
    ],
    returns: [
      {
        name: "void",
        type: "void",
        description: "Returns nothing.",
      },
    ],
  },
  "use-page-visibility": {
    demo: UsePageVisibilityDocDemo,
    usage: `
import { usePageVisibility } from "hookli";

export function Demo() {
  const isVisible = usePageVisibility();

  return (
    <div>
      <p>Tab is currently: {isVisible ? "Visible" : "Hidden"}</p>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "isVisible",
        type: "boolean",
        description: "True if the document/tab is currently visible, false when hidden or backgrounded.",
      },
    ],
  },
  "use-deep-compare-effect": {
    demo: UseDeepCompareEffectDocDemo,
    usage: `
import { useState } from "react";
import { useDeepCompareEffect } from "hookli";

export function Demo() {
  const [user, setUser] = useState({ name: "Alice", age: 25 });

  useDeepCompareEffect(() => {
    console.log("Deep effect triggered:", user);
  }, [user]);

  return (
    <div>
      <p>{user.name} ({user.age})</p>
      <button onClick={() => setUser({ ...user })}>Recreate object reference</button>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>Increment age</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "effect",
        type: "EffectCallback",
        description: "Effect callback executed when deep structural dependencies change.",
      },
      {
        name: "deps",
        type: "DependencyList",
        description: "Dependencies compared via deep structural equality instead of reference.",
      },
    ],
    returns: [
      {
        name: "void",
        type: "void",
        description: "Returns nothing.",
      },
    ],
  },
  "use-key-press": {
    demo: UseKeyPressDocDemo,
    usage: `
import { useKeyPress } from "hookli";

export function Demo() {
  const enterPressed = useKeyPress("Enter");
  const escapePressed = useKeyPress("Escape");

  return (
    <div>
      <p>Enter: {enterPressed ? "Pressed" : "Released"}</p>
      <p>Escape: {escapePressed ? "Pressed" : "Released"}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "targetKey",
        type: "string",
        description: "The KeyboardEvent.key to watch (e.g. 'Enter', 'Escape').",
      },
    ],
    returns: [
      {
        name: "pressed",
        type: "boolean",
        description: "True while the specified key is held down.",
      },
    ],
  },
  "use-window-scroll": {
    demo: UseWindowScrollDocDemo,
    usage: `
import { useWindowScroll } from "hookli";

export function Demo() {
  const { x, y } = useWindowScroll();

  return (
    <div>
      <p>Scroll X: {x}px</p>
      <p>Scroll Y: {y}px</p>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "scroll",
        type: "{ x: number; y: number }",
        description: "The current horizontal (x) and vertical (y) scroll position in pixels.",
      },
    ],
  },
  "use-idle": {
    demo: UseIdleDocDemo,
    usage: `
import { useIdle } from "hookli";

export function Demo() {
  const isIdle = useIdle(5000);

  return (
    <div>
      <p>User is: {isIdle ? "Idle" : "Active"}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "ms",
        type: "number",
        defaultValue: "60000",
        description: "Inactivity threshold in milliseconds before switching to idle.",
      },
    ],
    returns: [
      {
        name: "isIdle",
        type: "boolean",
        description: "True if user has been inactive for at least ms milliseconds.",
      },
    ],
  },
  "use-text-selection": {
    demo: UseTextSelectionDocDemo,
    usage: `
import { useTextSelection } from "hookli";

export function Demo() {
  const selection = useTextSelection();

  return (
    <div>
      <p>Select text on this page.</p>
      <p>Selected: {selection || "(none)"}</p>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "text",
        type: "string",
        description: "The currently selected text on the document.",
      },
    ],
  },
  "use-long-press": {
    demo: UseLongPressDocDemo,
    usage: `
import { useLongPress } from "hookli";

export function Demo() {
  const handlers = useLongPress(() => {
    alert("Long pressed!");
  }, { delay: 500 });

  return <button {...handlers}>Press and hold</button>;
}
`,
    parameters: [
      {
        name: "callback",
        type: "(event: MouseEvent | TouchEvent) => void",
        description: "Callback invoked once the press is held for delay ms.",
      },
      {
        name: "options",
        type: "UseLongPressOptions",
        defaultValue: "{}",
        description: "Options object containing delay (defaults to 400ms).",
      },
    ],
    returns: [
      {
        name: "handlers",
        type: "UseLongPressHandlers",
        description: "Event handlers (onMouseDown, onMouseUp, etc.) to spread onto the target element.",
      },
    ],
  },
  "use-hotkeys": {
    demo: UseHotkeysDocDemo,
    usage: `
import { useHotkeys } from "hookli";

export function Demo() {
  useHotkeys("ctrl+k", () => {
    console.log("Ctrl+K pressed");
  });

  return <div>Press Ctrl+K to trigger shortcut</div>;
}
`,
    parameters: [
      {
        name: "keys",
        type: "string",
        description: "Key combination string separated by '+' (e.g. 'ctrl+k', 'shift+s').",
      },
      {
        name: "callback",
        type: "(event: KeyboardEvent) => void",
        description: "Function called when the key combination is pressed.",
      },
    ],
    returns: [
      {
        name: "void",
        type: "void",
        description: "Returns nothing.",
      },
    ],
  },
  "use-fullscreen": {
    demo: UseFullscreenDocDemo,
    usage: `
import { useRef } from "react";
import { useFullscreen } from "hookli";

export function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(ref);

  return (
    <div ref={ref}>
      <button onClick={toggle}>
        {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      </button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "ref",
        type: "RefObject<HTMLElement | null>",
        description: "Ref attached to the element to control fullscreen for.",
      },
    ],
    returns: [
      {
        name: "fullscreen",
        type: "UseFullscreenReturn",
        description: "Object containing isFullscreen state and enter, exit, toggle methods.",
      },
    ],
    typeAliases: [USE_FULLSCREEN_RETURN_ALIAS],
  },
  "use-async": {
    demo: UseAsyncDocDemo,
    usage: `
import { useAsync } from "hookli";

const fetchData = async () => {
  const res = await fetch("https://api.example.com/data");
  return res.json();
};

export function Demo() {
  const { value, loading, error, execute } = useAsync(fetchData);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
      <button onClick={execute}>Reload</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "asyncFunction",
        type: "() => Promise<T>",
        description: "The asynchronous function to execute.",
      },
      {
        name: "immediate",
        type: "boolean",
        defaultValue: "true",
        description: "Whether to execute the async function immediately on mount.",
      },
    ],
    returns: [
      {
        name: "state",
        type: "UseAsyncReturn<T>",
        description: "Object containing loading, error, value, and execute handler.",
      },
    ],
    typeAliases: [USE_ASYNC_RETURN_ALIAS],
  },
  "use-mutation": {
    demo: UseMutationDocDemo,
    usage: `
import { useMutation } from "hookli";

const createUser = async (name: string) => {
  const res = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export function Demo() {
  const { mutate, data, isLoading } = useMutation(createUser);

  return (
    <div>
      <button disabled={isLoading} onClick={() => mutate("Alice")}>
        {isLoading ? "Saving..." : "Create User"}
      </button>
      {data && <p>Created ID: {data.id}</p>}
    </div>
  );
}
`,
    parameters: [
      {
        name: "mutationFn",
        type: "(...args: TArgs) => Promise<TData>",
        description: "Async function to execute when mutate is called.",
      },
    ],
    returns: [
      {
        name: "mutation",
        type: "UseMutationReturn<TArgs, TData>",
        description: "Object containing mutate, status, isLoading, data, error, and reset.",
      },
    ],
    typeAliases: [USE_MUTATION_RETURN_ALIAS],
  },
  "use-pagination": {
    demo: UsePaginationDocDemo,
    usage: `
import { usePagination } from "hookli";

export function Demo() {
  const { page, totalPages, next, prev, canNext, canPrev } = usePagination({
    total: 100,
    pageSize: 10,
    initialPage: 1,
  });

  return (
    <div>
      <p>Page {page} of {totalPages}</p>
      <button disabled={!canPrev} onClick={prev}>Prev</button>
      <button disabled={!canNext} onClick={next}>Next</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "options",
        type: "UsePaginationOptions",
        defaultValue: "{}",
        description: "Options object with total (default 0), pageSize (default 10), and initialPage (default 1).",
      },
    ],
    returns: [
      {
        name: "pagination",
        type: "UsePaginationReturn",
        description: "Pagination state and controls (page, totalPages, next, prev, first, last, range).",
      },
    ],
    typeAliases: [USE_PAGINATION_RETURN_ALIAS],
  },
  "use-network-state": {
    demo: UseNetworkStateDocDemo,
    usage: `
import { useNetworkState } from "hookli";

export function Demo() {
  const { online, effectiveType, downlink } = useNetworkState();

  return (
    <div>
      <p>Status: {online ? "Online" : "Offline"}</p>
      <p>Effective Type: {effectiveType ?? "unknown"}</p>
      <p>Downlink: {downlink ?? 0} Mbps</p>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "networkState",
        type: "NetworkState",
        description: "Snapshot of network status (online, effectiveType, downlink, rtt, saveData).",
      },
    ],
    typeAliases: [USE_NETWORK_STATE_ALIAS],
  },
  "use-battery": {
    demo: UseBatteryDocDemo,
    usage: `
import { useBattery } from "hookli";

export function Demo() {
  const { supported, level, charging } = useBattery();

  if (!supported) return <p>Battery API not supported</p>;

  return (
    <div>
      <p>Battery level: {level !== null ? Math.round(level * 100) : 0}%</p>
      <p>Charging: {charging ? "Yes" : "No"}</p>
    </div>
  );
}
`,
    parameters: [],
    returns: [
      {
        name: "batteryState",
        type: "BatteryState",
        description: "Snapshot of device battery status (supported, loading, level, charging, chargingTime, dischargingTime).",
      },
    ],
    typeAliases: [USE_BATTERY_STATE_ALIAS],
  },
  "use-permission": {
    demo: UsePermissionDocDemo,
    usage: `
import { usePermission } from "hookli";

export function Demo() {
  const status = usePermission("geolocation");

  return <p>Geolocation permission: {status}</p>;
}
`,
    parameters: [
      {
        name: "name",
        type: "PermissionName",
        description: "The permission name to query (e.g. 'geolocation', 'notifications').",
      },
    ],
    returns: [
      {
        name: "status",
        type: "UsePermissionResult",
        description: "The permission state ('granted', 'denied', 'prompt', 'pending', or 'unsupported').",
      },
    ],
  },
};

export function getHookDoc(slug: string): HookDoc | undefined {
  return HOOK_DOCS[slug];
}
