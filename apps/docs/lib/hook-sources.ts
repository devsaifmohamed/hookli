import { GITHUB_URL } from "@/lib/site";

/* Vendored implementation snapshots for the "Hook" section on every doc page
   (T16 usehooks-ts anatomy). Reconstructed faithfully from the installed
   hookli@1.4.0 bundle (node_modules/hookli/dist/index.mjs) with the exported
   type signatures from index.d.ts — bundler artifacts (helper prelude, aliased
   imports) removed so each entry reads as its original src/hooks/*.ts.
   Keep in sync when the pinned hookli version changes. */

export type HookSource = {
  /* Repo-relative path, also the code-block filename. */
  path: string;
  source: string;
};

const REPO_BLOB = `${GITHUB_URL}/blob/main`;

const HOOK_SOURCES: Partial<Record<string, HookSource>> = {
  "use-toggle": {
    path: "src/hooks/useToggle.hook.ts",
    source: `import { useCallback, useState } from "react";

export const useToggle = (
  initialValue = false,
): [boolean, () => void, (value: boolean) => void] => {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  const setExplicit = useCallback((value: boolean) => {
    setState(value);
  }, []);

  return [state, toggle, setExplicit];
};
`,
  },
  "use-form": {
    path: "src/hooks/useForm.hook.ts",
    source: `import { ChangeEvent, useState } from "react";

interface UseFormValues {
  [key: string]: string | number | boolean;
}

export const useForm = <T extends UseFormValues>(initialState: T) => {
  const [values, setValues] = useState<T>(initialState);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const resetForm = () => {
    setValues(initialState);
  };

  return { values, handleChange, resetForm };
};
`,
  },
  "use-local-storage": {
    path: "src/hooks/useLocalStorage.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    const parsedValue = item ? JSON.parse(item) : initialValue;
    setValue(parsedValue);
  }, [key, initialValue]);

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    const updatedValue =
      newValue instanceof Function ? newValue(value) : newValue;
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
    setValue(updatedValue);
  };

  return { value, setStoredValue };
};
`,
  },
  "use-local-storage-with-expiry": {
    path: "src/hooks/useLocalStorageWithExpiry.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useLocalStorageWithExpiry = <T>(
  key: string,
  initialValue: T,
  expiryMs: number,
) => {
  const read = (): T | null => {
    if (typeof window === "undefined") return initialValue;

    const raw = window.localStorage.getItem(key);
    if (!raw) return initialValue;

    try {
      const item = JSON.parse(raw);
      if (
        item &&
        typeof item.expiry === "number" &&
        Date.now() > item.expiry
      ) {
        window.localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T | null>(initialValue);

  useEffect(() => {
    setValue(read());
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (typeof window === "undefined") return;

    const item = { value: newValue, expiry: Date.now() + expiryMs };
    window.localStorage.setItem(key, JSON.stringify(item));
  };

  return { value, setStoredValue };
};
`,
  },
  "use-session-storage": {
    path: "src/hooks/use-session-storage/use-session-storage.ts",
    source: `import { useCallback, useEffect, useState } from "react";
import { useEventCallback } from "../use-event-callback/use-event-callback";
import { useEventListener } from "../use-event-listener/use-event-listener";

interface UseSessionStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
}

type UseSessionStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void,
];

const IS_SERVER = typeof window === "undefined";

export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {},
): UseSessionStorageReturn<T> {
  const { initializeWithValue = true } = options;

  const serializer = useCallback(
    (value: T) => {
      if (options.serializer) return options.serializer(value);
      return JSON.stringify(value);
    },
    [options],
  );

  const deserializer = useCallback(
    (value: string): T => {
      if (options.deserializer) return options.deserializer(value);
      const defaultValue =
        initialValue instanceof Function ? initialValue() : initialValue;
      if (value === "undefined") return defaultValue;
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    },
    [options, initialValue],
  );

  const readValue = useCallback((): T => {
    const initial =
      initialValue instanceof Function ? initialValue() : initialValue;
    if (IS_SERVER) return initial;
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? deserializer(raw) : initial;
    } catch {
      return initial;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(() =>
    initializeWithValue
      ? readValue()
      : initialValue instanceof Function
        ? initialValue()
        : initialValue,
  );

  const setValue = useEventCallback((value: T | ((prev: T) => T)) => {
    if (IS_SERVER) return;
    try {
      const newValue = value instanceof Function ? value(readValue()) : value;
      window.sessionStorage.setItem(key, serializer(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new StorageEvent("session-storage", { key }));
    } catch {
      return;
    }
  });

  const removeValue = useEventCallback(() => {
    if (IS_SERVER) return;
    const defaultValue =
      initialValue instanceof Function ? initialValue() : initialValue;
    window.sessionStorage.removeItem(key);
    setStoredValue(defaultValue);
    window.dispatchEvent(new StorageEvent("session-storage", { key }));
  });

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key && event.key !== key) return;
      setStoredValue(readValue());
    },
    [key, readValue],
  );

  useEventListener("storage", handleStorageChange);
  useEventListener("session-storage", handleStorageChange);

  return [storedValue, setValue, removeValue];
}
`,
  },
  "use-read-local-storage": {
    path: "src/hooks/use-read-local-storage/use-read-local-storage.ts",
    source: `import { useCallback, useEffect, useState } from "react";
import { useEventListener } from "../use-event-listener/use-event-listener";

interface UseReadLocalStorageOptions<T> {
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
}

const IS_SERVER = typeof window === "undefined";

export function useReadLocalStorage<T>(
  key: string,
  options: UseReadLocalStorageOptions<T> = {},
): T | null {
  const { initializeWithValue = true } = options;

  const deserializer = useCallback(
    (value: string): T | undefined => {
      if (options.deserializer) return options.deserializer(value);
      if (value === "undefined") return undefined;
      try {
        return JSON.parse(value);
      } catch {
        return value as unknown as T;
      }
    },
    [options],
  );

  const readValue = useCallback((): T | null => {
    if (IS_SERVER) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (deserializer(raw) as T) : null;
    } catch {
      return null;
    }
  }, [key, deserializer]);

  const [storedValue, setStoredValue] = useState<T | null>(() =>
    initializeWithValue ? readValue() : null,
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key && event.key !== key) return;
      setStoredValue(readValue());
    },
    [key, readValue],
  );

  useEventListener("storage", handleStorageChange);
  useEventListener("local-storage", handleStorageChange);

  return storedValue;
}
`,
  },
  "use-dark-mode": {
    path: "src/hooks/useDarkMode.hook.ts",
    source: `import { useEffect, useState } from "react";

interface UseDarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useDarkMode = (): UseDarkModeState => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const bodyElement = document.body;
    const darkClass = "dark";

    bodyElement.classList.toggle(darkClass, isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    return () => {
      bodyElement.classList.remove(darkClass);
    };
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
`,
  },
  "use-boolean": {
    path: "src/hooks/use-boolean/use-boolean.ts",
    source: `import { useCallback, useState } from "react";

export interface UseBooleanReturn {
  value: boolean;
  setValue: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export const useBoolean = (defaultValue = false): UseBooleanReturn => {
  const [value, setValue] = useState(defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setValue, setTrue, setFalse, toggle };
};
`,
  },
  "use-counter": {
    path: "src/hooks/use-counter/use-counter.ts",
    source: `import { Dispatch, SetStateAction, useCallback, useState } from "react";

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: Dispatch<SetStateAction<number>>;
}

export const useCounter = (initialValue = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((prev) => prev + 1), []);
  const decrement = useCallback(() => setCount((prev) => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset, setCount };
};
`,
  },
  "use-step": {
    path: "src/hooks/use-step/use-step.ts",
    source: `import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

export interface UseStepActions {
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  setStep: Dispatch<SetStateAction<number>>;
}

export const useStep = (maxStep: number): [number, UseStepActions] => {
  const [currentStep, setCurrentStep] = useState(1);

  const canGoToNextStep = useMemo(
    () => currentStep + 1 <= maxStep,
    [currentStep, maxStep],
  );
  const canGoToPrevStep = useMemo(() => currentStep - 1 >= 1, [currentStep]);

  const setStep = useCallback<Dispatch<SetStateAction<number>>>(
    (step) => {
      setCurrentStep((prev) => {
        const newStep = step instanceof Function ? step(prev) : step;
        if (newStep >= 1 && newStep <= maxStep) {
          return newStep;
        }
        throw new Error("Step not valid");
      });
    },
    [maxStep],
  );

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1 <= maxStep ? prev + 1 : prev));
  }, [maxStep]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 >= 1 ? prev - 1 : prev));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return [
    currentStep,
    { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, setStep, reset },
  ];
};
`,
  },
  "use-countdown": {
    path: "src/hooks/use-countdown/use-countdown.ts",
    source: `import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCountdownOptions {
  countStart: number;
  intervalMs?: number;
  isIncrement?: boolean;
  countStop?: number;
}

export interface UseCountdownActions {
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
}

export const useCountdown = ({
  countStart,
  intervalMs = 1000,
  isIncrement = false,
  countStop = 0,
}: UseCountdownOptions): [number, UseCountdownActions] => {
  const [count, setCount] = useState(countStart);
  const [isRunning, setIsRunning] = useState(false);

  const startCountdown = useCallback(() => setIsRunning(true), []);
  const stopCountdown = useCallback(() => setIsRunning(false), []);
  const resetCountdown = useCallback(() => {
    setIsRunning(false);
    setCount(countStart);
  }, [countStart]);

  const tick = useRef(() => {});
  tick.current = () => {
    setCount((prev) => (isIncrement ? prev + 1 : prev - 1));
  };

  useEffect(() => {
    if (isRunning && count === countStop) {
      setIsRunning(false);
    }
  }, [count, countStop, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => tick.current(), intervalMs);
    return () => clearInterval(id);
  }, [isRunning, intervalMs]);

  return [count, { startCountdown, stopCountdown, resetCountdown }];
};
`,
  },
  "use-map": {
    path: "src/hooks/use-map/use-map.ts",
    source: `import { useCallback, useState } from "react";

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

export interface UseMapActions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: MapOrEntries<K, V>) => void;
  remove: (key: K) => void;
  reset: () => void;
}

export type ReadOnlyMap<K, V> = Omit<Map<K, V>, "set" | "clear" | "delete">;

export type UseMapReturn<K, V> = [ReadOnlyMap<K, V>, UseMapActions<K, V>];

export function useMap<K, V>(
  initialState: MapOrEntries<K, V> = new Map(),
): UseMapReturn<K, V> {
  const [map, setMap] = useState(() => new Map(initialState));

  const set = useCallback((key: K, value: V) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const setAll = useCallback((entries: MapOrEntries<K, V>) => {
    setMap(new Map(entries));
  }, []);

  const remove = useCallback((key: K) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMap(new Map());
  }, []);

  return [map, { set, setAll, remove, reset }];
}
`,
  },
  "use-debounce": {
    path: "src/hooks/useDebounce.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
`,
  },
  "use-debounce-callback": {
    path: "src/hooks/use-debounce-callback/use-debounce-callback.ts",
    source: `import { useEffect, useMemo, useRef } from "react";
import { useEventCallback } from "../use-event-callback/use-event-callback";
import { useUnmount } from "../use-unmount/use-unmount";

export interface DebounceOptions {
  /** Invoke on the leading edge of the timeout. Defaults to \`false\`. */
  leading?: boolean;
  /** Invoke on the trailing edge of the timeout. Defaults to \`true\`. */
  trailing?: boolean;
  /** Maximum time the callback may be delayed before it is forced to run. */
  maxWait?: number;
}

export interface DebouncedState<Args extends unknown[], R> {
  (...args: Args): R | undefined;
  cancel: () => void;
  flush: () => R | undefined;
  isPending: () => boolean;
}

export const useDebounceCallback = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delayMs = 500,
  options: DebounceOptions = {},
): DebouncedState<Args, R> => {
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const maxTimeoutId = useRef<ReturnType<typeof setTimeout>>();
  const lastArgs = useRef<Args>();
  const lastResult = useRef<R>();
  const lastInvokeTime = useRef(0);

  const { leading = false, trailing = true, maxWait } = options;
  const latestFn = useEventCallback(fn);

  useEffect(() => {
    lastInvokeTime.current = 0;
  }, [delayMs, leading, trailing, maxWait]);

  const debounced = useMemo(() => {
    const invoke = (): R | undefined => {
      const args = lastArgs.current;
      if (!args) return undefined;
      lastArgs.current = undefined;
      lastInvokeTime.current = Date.now();
      lastResult.current = latestFn(...args);
      return lastResult.current;
    };

    const clearTimers = () => {
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      if (maxTimeoutId.current !== undefined) {
        clearTimeout(maxTimeoutId.current);
        maxTimeoutId.current = undefined;
      }
    };

    const trailingEdge = () => {
      clearTimers();
      if (trailing && lastArgs.current) invoke();
      else lastArgs.current = undefined;
    };

    const state = Object.assign(
      (...args: Args): R | undefined => {
        lastArgs.current = args;
        const isFirstCall =
          timeoutId.current === undefined && maxTimeoutId.current === undefined;
        if (timeoutId.current !== undefined) clearTimeout(timeoutId.current);
        if (leading && isFirstCall) invoke();
        timeoutId.current = setTimeout(trailingEdge, delayMs);
        if (maxWait !== undefined && maxTimeoutId.current === undefined) {
          maxTimeoutId.current = setTimeout(() => {
            clearTimers();
            if (lastArgs.current) invoke();
          }, maxWait);
        }
        return lastResult.current;
      },
      {
        cancel: () => {
          clearTimers();
          lastArgs.current = undefined;
        },
        flush: (): R | undefined => {
          if (timeoutId.current === undefined) return lastResult.current;
          clearTimers();
          return lastArgs.current ? invoke() : lastResult.current;
        },
        isPending: () =>
          timeoutId.current !== undefined && lastArgs.current !== undefined,
      },
    );

    return state;
  }, [delayMs, leading, trailing, maxWait, latestFn]);

  useUnmount(() => {
    debounced.cancel();
  });

  return debounced;
};
`,
  },
  "use-debounce-value": {
    path: "src/hooks/use-debounce-value/use-debounce-value.ts",
    source: `import { useEffect, useRef, useState } from "react";
import {
  useDebounceCallback,
  type DebounceOptions,
  type DebouncedState,
} from "../use-debounce-callback/use-debounce-callback";

export type UseDebounceValueReturn<T> = [
  T,
  DebouncedState<[value: T | ((prev: T) => T)], void>,
];

export const useDebounceValue = <T>(
  initialValue: T | (() => T),
  delayMs = 500,
  options: DebounceOptions & { equalityFn?: (left: T, right: T) => boolean } = {},
): UseDebounceValueReturn<T> => {
  const eq = options.equalityFn ?? ((left, right) => left === right);
  const unwrap = (v: T | (() => T)): T =>
    typeof v === "function" ? (v as () => T)() : v;

  const [debouncedValue, setDebouncedValue] = useState<T>(() =>
    unwrap(initialValue),
  );
  const previousValue = useRef(debouncedValue);

  const updateDebouncedValue = useDebounceCallback(
    (value: T | ((prev: T) => T)) => {
      const next =
        typeof value === "function"
          ? (value as (prev: T) => T)(previousValue.current)
          : value;
      if (!eq(previousValue.current, next)) {
        previousValue.current = next;
        setDebouncedValue(next);
      }
    },
    delayMs,
    options,
  );

  useEffect(() => {
    return () => updateDebouncedValue.cancel();
  }, [updateDebouncedValue]);

  return [debouncedValue, updateDebouncedValue];
};
`,
  },
  "use-interval": {
    path: "src/hooks/use-interval/use-interval.ts",
    source: `import { useEffect, useRef } from "react";

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
`,
  },
  "use-timeout": {
    path: "src/hooks/use-timeout/use-timeout.ts",
    source: `import { useEffect, useRef } from "react";

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};
`,
  },
  "use-isomorphic-layout-effect": {
    path: "src/hooks/use-isomorphic-layout-effect/use-isomorphic-layout-effect.ts",
    source: `import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect that safely falls back to useEffect on the server, where
 * useLayoutEffect would warn. Picks the layout effect only when a DOM exists.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
`,
  },
  "use-event-callback": {
    path: "src/hooks/use-event-callback/use-event-callback.ts",
    source: `import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

export const useEventCallback = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
) => {
  const ref = useRef<(...args: Args) => R>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: Args) => ref.current(...args), [ref]);
};
`,
  },
  "use-unmount": {
    path: "src/hooks/use-unmount/use-unmount.ts",
    source: `import { useEffect, useRef } from "react";

export const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn);

  // The latest closure every render, but only invoked on unmount.
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};
`,
  },
  "use-is-client": {
    path: "src/hooks/use-is-client/use-is-client.ts",
    source: `import { useEffect, useState } from "react";

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
`,
  },
  "use-is-mounted": {
    path: "src/hooks/use-is-mounted/use-is-mounted.ts",
    source: `import { useCallback, useEffect, useRef } from "react";

export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};
`,
  },
  "use-document-title": {
    path: "src/hooks/use-document-title/use-document-title.ts",
    source: `import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";
import { useUnmount } from "../use-unmount/use-unmount";

interface UseDocumentTitleOptions {
  preserveTitleOnUnmount?: boolean;
}

export const useDocumentTitle = (
  title: string,
  options: UseDocumentTitleOptions = {},
) => {
  const { preserveTitleOnUnmount = true } = options;
  const defaultTitle = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    defaultTitle.current = window.document.title;
  }, []);

  useIsomorphicLayoutEffect(() => {
    window.document.title = title;
  }, [title]);

  useUnmount(() => {
    if (!preserveTitleOnUnmount && defaultTitle.current !== null) {
      window.document.title = defaultTitle.current;
    }
  });
};
`,
  },
  "use-event-listener": {
    path: "src/hooks/use-event-listener/use-event-listener.ts",
    source: `import { RefObject, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: RefObject<MediaQueryList>,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: RefObject<Document>,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<
  K extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
  T extends HTMLElement | SVGElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K] | SVGElementEventMap[K]) => void,
  element: RefObject<T>,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: RefObject<HTMLElement | MediaQueryList | Document>,
  options?: boolean | AddEventListenerOptions,
) {
  // Hold the handler in a ref so updating it never detaches the listener.
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current ?? window;
    if (!targetElement?.addEventListener) return;

    const listener = (event: Event) => savedHandler.current(event);
    targetElement.addEventListener(eventName, listener, options);

    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

export { useEventListener };
`,
  },
  "use-click-outside": {
    path: "src/hooks/useClickOutside.hook.ts",
    source: `import { Ref, useEffect } from "react";

type ClickOutsideCallback = () => void;

export const useClickOutside = <T extends HTMLElement>(
  ref: Ref<T>,
  callback: ClickOutsideCallback,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref &&
        "current" in ref &&
        !ref.current?.contains(event.target as Node)
      ) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};
`,
  },
  "use-mouse-position": {
    path: "src/hooks/useMousePosition.hook.ts",
    source: `import { Ref, useEffect, useState } from "react";

interface MousePosition {
  x: number | null;
  y: number | null;
}

export const useMousePosition = <T extends HTMLElement>(
  ref: Ref<T>,
): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if (ref && "current" in ref && ref.current) {
        const { left, top } = ref.current.getBoundingClientRect();
        setMousePosition({ x: clientX - left, y: clientY - top });
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [ref]);

  return mousePosition;
};
`,
  },
  "use-infinite-scroll": {
    path: "src/hooks/useInfiniteScroll.hook.ts",
    source: `import { useEffect, useState } from "react";

type FetchMoreData = () => Promise<void>;

export const useInfiniteScroll = (fetchMoreData: FetchMoreData): boolean => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500;

      if (isNearBottom && !isFetching) {
        setIsFetching(true);
        fetchMoreData().then(() => setIsFetching(false));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, isFetching]);

  return isFetching;
};
`,
  },
  "use-hover": {
    path: "src/hooks/use-hover/use-hover.ts",
    source: `import { RefObject, useState } from "react";
import { useEventListener } from "../use-event-listener/use-event-listener";

export const useHover = <T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
): boolean => {
  const [isHovered, setIsHovered] = useState(false);

  useEventListener("mouseenter", () => setIsHovered(true), elementRef);
  useEventListener("mouseleave", () => setIsHovered(false), elementRef);

  return isHovered;
};
`,
  },
  "use-intersection-observer": {
    path: "src/hooks/use-intersection-observer/use-intersection-observer.ts",
    source: `import { useCallback, useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | Document | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
  onChange?: (
    isIntersecting: boolean,
    entry: IntersectionObserverEntry,
  ) => void;
}

interface UseIntersectionObserverReturn {
  ref: (node: Element | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
  initialIsIntersecting = false,
  onChange,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn => {
  const [element, setElement] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (frozen) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);
        onChangeRef.current?.(observerEntry.isIntersecting, observerEntry);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, JSON.stringify(threshold), root, rootMargin, frozen]);

  return { ref, isIntersecting, entry };
};
`,
  },
  "use-resize-observer": {
    path: "src/hooks/use-resize-observer/use-resize-observer.ts",
    source: `import { RefObject, useEffect, useRef, useState } from "react";

interface ResizeObserverSize {
  width: number | undefined;
  height: number | undefined;
}

interface UseResizeObserverOptions {
  box?: ResizeObserverBoxOptions;
  onResize?: (size: ResizeObserverSize) => void;
}

export const useResizeObserver = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options: UseResizeObserverOptions = {},
): ResizeObserverSize => {
  const { box = "content-box" } = options;
  const [size, setSize] = useState<ResizeObserverSize>({
    width: undefined,
    height: undefined,
  });

  const onResizeRef = useRef(options.onResize);
  onResizeRef.current = options.onResize;

  const previous = useRef<ResizeObserverSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const boxSize =
        box === "border-box"
          ? entry.borderBoxSize
          : box === "device-pixel-content-box"
            ? entry.devicePixelContentBoxSize
            : entry.contentBoxSize;

      const measured = Array.isArray(boxSize) ? boxSize[0] : boxSize;
      const width = measured ? measured.inlineSize : entry.contentRect.width;
      const height = measured ? measured.blockSize : entry.contentRect.height;

      if (
        previous.current.width === width &&
        previous.current.height === height
      ) {
        return;
      }

      const next = { width, height };
      previous.current = next;
      setSize(next);
      onResizeRef.current?.(next);
    });

    observer.observe(element, { box });
    return () => {
      observer.disconnect();
    };
  }, [ref, box]);

  return size;
};
`,
  },
  "use-scroll-lock": {
    path: "src/hooks/use-scroll-lock/use-scroll-lock.ts",
    source: `import { useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

interface UseScrollLockOptions {
  autoLock?: boolean;
  lockTarget?: HTMLElement | string;
  widthReflow?: boolean;
}

interface UseScrollLockReturn {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
}

interface OriginalStyle {
  overflow: string;
  paddingRight: string;
}

export const useScrollLock = (
  options: UseScrollLockOptions = {},
): UseScrollLockReturn => {
  const { autoLock = true, lockTarget, widthReflow = true } = options;
  const [isLocked, setIsLocked] = useState(false);
  const target = useRef<HTMLElement | null>(null);
  const originalStyle = useRef<OriginalStyle | null>(null);

  const resolveTarget = useCallback((): HTMLElement | null => {
    if (typeof document === "undefined") return null;
    if (lockTarget instanceof HTMLElement) return lockTarget;
    if (typeof lockTarget === "string") {
      return document.querySelector<HTMLElement>(lockTarget);
    }
    return document.body;
  }, [lockTarget]);

  const lock = useCallback(() => {
    const node = resolveTarget();
    if (!node) return;

    target.current = node;
    originalStyle.current = {
      overflow: node.style.overflow,
      paddingRight: node.style.paddingRight,
    };

    if (widthReflow && typeof window !== "undefined") {
      const scrollbarWidth = window.innerWidth - node.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPadding =
          parseInt(window.getComputedStyle(node).paddingRight, 10) || 0;
        node.style.paddingRight = \`\${currentPadding + scrollbarWidth}px\`;
      }
    }

    node.style.overflow = "hidden";
    setIsLocked(true);
  }, [resolveTarget, widthReflow]);

  const unlock = useCallback(() => {
    const node = target.current;
    if (!node || !originalStyle.current) return;

    node.style.overflow = originalStyle.current.overflow;
    node.style.paddingRight = originalStyle.current.paddingRight;
    originalStyle.current = null;
    setIsLocked(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!autoLock) return;
    lock();
    return () => {
      unlock();
    };
  }, [autoLock, lock, unlock]);

  return { isLocked, lock, unlock };
};
`,
  },
  "use-click-any-where": {
    path: "src/hooks/use-click-any-where/use-click-any-where.ts",
    source: `import { useEventListener } from "../use-event-listener/use-event-listener";

export const useClickAnyWhere = (
  handler: (event: MouseEvent) => void,
): void => {
  useEventListener("click", handler);
};
`,
  },
  "use-media-query": {
    path: "src/hooks/use-media-query/use-media-query.ts",
    source: `import { useState } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  const getMatches = (mediaQuery: string): boolean => {
    if (IS_SERVER) return defaultValue;
    return window.matchMedia(mediaQuery).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) return getMatches(query);
    return defaultValue;
  });

  useIsomorphicLayoutEffect(() => {
    if (IS_SERVER) return;
    const matchMedia = window.matchMedia(query);
    const handleChange = () => setMatches(matchMedia.matches);
    handleChange();
    matchMedia.addEventListener("change", handleChange);
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
`,
  },
  "use-screen": {
    path: "src/hooks/use-screen/use-screen.ts",
    source: `import { useState } from "react";
import { useEventListener } from "../use-event-listener/use-event-listener";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

interface UseScreenOptions {
  initializeWithValue?: boolean;
}

const IS_SERVER = typeof window === "undefined";

export function useScreen(options: UseScreenOptions = {}): Screen | null {
  const { initializeWithValue = true } = options;

  const readScreen = (): Screen | null => {
    if (IS_SERVER) return null;
    return window.screen;
  };

  const [screen, setScreen] = useState<Screen | null>(() => {
    if (initializeWithValue) return readScreen();
    return null;
  });

  const handleSize = () => {
    setScreen(readScreen());
  };

  useEventListener("resize", handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return screen;
}
`,
  },
  "use-window-size": {
    path: "src/hooks/use-window-size/use-window-size.ts",
    source: `import { useState } from "react";
import { useEventListener } from "../use-event-listener/use-event-listener";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect/use-isomorphic-layout-effect";

interface WindowSize {
  width: number;
  height: number;
}

interface UseWindowSizeOptions {
  initializeWithValue?: boolean;
}

const IS_SERVER = typeof window === "undefined";

export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { initializeWithValue = true } = options;

  const readSize = (): WindowSize => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (initializeWithValue && !IS_SERVER) return readSize();
    return { width: 0, height: 0 };
  });

  const handleSize = () => {
    if (IS_SERVER) return;
    setWindowSize(readSize());
  };

  useEventListener("resize", handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return windowSize;
}
`,
  },
  "use-ternary-dark-mode": {
    path: "src/hooks/use-ternary-dark-mode/use-ternary-dark-mode.ts",
    source: `import { useCallback } from "react";
import { useLocalStorage } from "../use-local-storage/use-local-storage";
import { useMediaQuery } from "../use-media-query/use-media-query";

type TernaryDarkMode = "system" | "dark" | "light";

interface UseTernaryDarkModeOptions {
  defaultValue?: TernaryDarkMode;
  localStorageKey?: string;
}

interface UseTernaryDarkModeReturn {
  isDarkMode: boolean;
  ternaryDarkMode: TernaryDarkMode;
  setTernaryDarkMode: (
    value: TernaryDarkMode | ((prev: TernaryDarkMode) => TernaryDarkMode),
  ) => void;
  toggleTernaryDarkMode: () => void;
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_STORAGE_KEY = "hookli-ternary-dark-mode";

export function useTernaryDarkMode(
  options: UseTernaryDarkModeOptions = {},
): UseTernaryDarkModeReturn {
  const { defaultValue = "system", localStorageKey = DEFAULT_STORAGE_KEY } =
    options;
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY);
  const { value: ternaryDarkMode, setStoredValue: setTernaryDarkMode } =
    useLocalStorage<TernaryDarkMode>(localStorageKey, defaultValue);

  const isDarkMode =
    ternaryDarkMode === "dark" || (ternaryDarkMode === "system" && isDarkOS);

  const toggleTernaryDarkMode = useCallback(() => {
    const cycle: TernaryDarkMode[] = ["light", "system", "dark"];
    setTernaryDarkMode((prev) => {
      const nextIndex = (cycle.indexOf(prev) + 1) % cycle.length;
      return cycle[nextIndex];
    });
  }, [setTernaryDarkMode]);

  return {
    isDarkMode,
    ternaryDarkMode,
    setTernaryDarkMode,
    toggleTernaryDarkMode,
  };
}
`,
  },
  "use-copy-to-clipboard": {
    path: "src/hooks/use-copy-to-clipboard/use-copy-to-clipboard.ts",
    source: `import { useCallback, useState } from "react";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;
type UseCopyToClipboardReturn = [CopiedValue, CopyFn];

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch {
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
`,
  },
  "use-script": {
    path: "src/hooks/use-script/use-script.ts",
    source: `import { useEffect, useState } from "react";

type UseScriptStatus = "idle" | "loading" | "ready" | "error";

interface UseScriptOptions {
  shouldPreventLoad?: boolean;
  removeOnUnmount?: boolean;
}

export function useScript(
  src: string | null,
  options?: UseScriptOptions,
): UseScriptStatus {
  const [status, setStatus] = useState<UseScriptStatus>(() => {
    if (!src || options?.shouldPreventLoad) return "idle";
    return "loading";
  });

  useEffect(() => {
    if (!src || options?.shouldPreventLoad) {
      setStatus("idle");
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      \`script[src="\${src}"]\`,
    );

    if (script === null) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttributeFromEvent = (event: Event) => {
        script?.setAttribute(
          "data-status",
          event.type === "load" ? "ready" : "error",
        );
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      setStatus(
        (script.getAttribute("data-status") as UseScriptStatus) ?? "loading",
      );
    }

    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
        if (options?.removeOnUnmount) {
          script.remove();
        }
      }
    };
  }, [src, options?.shouldPreventLoad, options?.removeOnUnmount]);

  return status;
}
`,
  },
  "use-fetch": {
    path: "src/hooks/useFetch.hook.ts",
    source: `import { useEffect, useState } from "react";

interface UseFetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export const useFetch = <T>(url: string): UseFetchResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};
`,
  },
  "use-geo-location": {
    path: "src/hooks/useGeoLocation.hook.ts",
    source: `import { useEffect, useState } from "react";

interface GeolocationError {
  code: number;
  message: string;
}

type GeolocationPosition = {
  coords: { latitude: number; longitude: number };
};

interface GeolocationState {
  location: GeolocationPosition | null;
  error: GeolocationError | Error | null;
}

export const useGeoLocation = (): GeolocationState => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | Error | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await getCurrentPosition();
        setLocation({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      } catch (err) {
        setError(err as Error);
      }
    };

    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            getLocation();
          } else if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              () => getLocation(),
              (err) => setError(err),
            );
          } else {
            setError(new Error("Geolocation permission denied"));
          }
        })
        .catch((err) => setError(err));
    } else {
      setError(new Error("Geolocation is not supported by this browser."));
    }
  }, []);

  return { location, error };
};

function getCurrentPosition(): Promise<globalThis.GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
`,
  },
};

export function getHookSource(slug: string): HookSource | undefined {
  return HOOK_SOURCES[slug];
}

export function hookSourceUrl(path: string): string {
  return `${REPO_BLOB}/${path}`;
}
