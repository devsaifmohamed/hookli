import type { ComponentType } from "react";
import type { ApiRow } from "@/components/api-table";
import { UseBooleanDocDemo } from "@/components/demos/use-boolean-demo";
import { UseClickOutsideDocDemo } from "@/components/demos/use-click-outside-demo";
import { UseCountdownDocDemo } from "@/components/demos/use-countdown-demo";
import { UseCounterDocDemo } from "@/components/demos/use-counter-demo";
import { UseDarkModeDocDemo } from "@/components/demos/use-dark-mode-demo";
import { UseDebounceDocDemo } from "@/components/demos/use-debounce-demo";
import { UseDocumentTitleDocDemo } from "@/components/demos/use-document-title-demo";
import { UseEventCallbackDocDemo } from "@/components/demos/use-event-callback-demo";
import { UseEventListenerDocDemo } from "@/components/demos/use-event-listener-demo";
import { UseFetchDocDemo } from "@/components/demos/use-fetch-demo";
import { UseFormDocDemo } from "@/components/demos/use-form-demo";
import { UseGeoLocationDocDemo } from "@/components/demos/use-geo-location-demo";
import { UseInfiniteScrollDocDemo } from "@/components/demos/use-infinite-scroll-demo";
import { UseIntervalDocDemo } from "@/components/demos/use-interval-demo";
import { UseIsClientDocDemo } from "@/components/demos/use-is-client-demo";
import { UseIsMountedDocDemo } from "@/components/demos/use-is-mounted-demo";
import { UseIsomorphicLayoutEffectDocDemo } from "@/components/demos/use-isomorphic-layout-effect-demo";
import { UseLocalStorageDocDemo } from "@/components/demos/use-local-storage-demo";
import { UseLocalStorageWithExpiryDocDemo } from "@/components/demos/use-local-storage-with-expiry-demo";
import { UseMapDocDemo } from "@/components/demos/use-map-demo";
import { UseMousePositionDocDemo } from "@/components/demos/use-mouse-position-demo";
import { UseStepDocDemo } from "@/components/demos/use-step-demo";
import { UseTimeoutDocDemo } from "@/components/demos/use-timeout-demo";
import { UseToggleDocDemo } from "@/components/demos/use-toggle-demo";
import { UseUnmountDocDemo } from "@/components/demos/use-unmount-demo";

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
        description: "A stable getter that returns true while mounted and false after unmount. Call it inside async callbacks before setting state; its identity never changes, so it is safe to omit from dependency arrays.",
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
};

export function getHookDoc(slug: string): HookDoc | undefined {
  return HOOK_DOCS[slug];
}
