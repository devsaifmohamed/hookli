import { useCallback, useEffect, useState } from "react";
import { useEventCallback } from "../use-event-callback";
import { useEventListener } from "../use-event-listener";

declare global {
  interface WindowEventMap {
    "session-storage": StorageEvent;
  }
}

const IS_SERVER = typeof window === "undefined";

/** Custom (de)serialization and hydration behaviour. */
export interface UseSessionStorageOptions<T> {
  /** Turn the value into the string stored under the key. Defaults to JSON.stringify. */
  serializer?: (value: T) => string;
  /** Parse the stored string back into a value. Defaults to JSON.parse. */
  deserializer?: (value: string) => T;
  /**
   * Read sessionStorage synchronously on mount. Set false to defer to after hydration and avoid
   * SSR mismatches. Defaults to `true`.
   */
  initializeWithValue?: boolean;
}

export type UseSessionStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void,
];

/**
 * `useState` backed by `sessionStorage`, synced across hooks in the same tab and
 * across tabs via the `storage` event.
 *
 * SSR-safe: when `initializeWithValue` is false (or on the server) the hook
 * starts from `initialValue` and hydrates from storage after mount. `setValue`
 * mirrors the `useState` API and accepts an updater; `removeValue` clears the
 * key and resets the state to `initialValue`.
 *
 * @category state
 * @keywords sessionStorage, tab session, per tab state, persist until tab closes
 * @param key - The sessionStorage key to read and write.
 * @param initialValue - Value used before hydration and when the key is empty. Pass a function to
 *   compute it lazily.
 * @param options - Optional custom serializer/deserializer and hydration flag.
 * @returns [0] value - The stored value. Server-rendered as initialValue, then hydrated from
 *   sessionStorage after mount.
 * @returns [1] setValue - Persists to sessionStorage and updates state; accepts a value or an
 *   updater. Syncs every hook using the key in this tab.
 * @returns [2] removeValue - Removes the key from sessionStorage and resets state to initialValue.
 *
 * @example Usage
 * ```tsx
 * import { useSessionStorage } from "hookli";
 *
 * export function Demo() {
 *   const [draft, setDraft, removeDraft] = useSessionStorage("draft", "");
 *
 *   return (
 *     <div>
 *       <input value={draft} onChange={(e) => setDraft(e.target.value)} />
 *       <button type="button" onClick={removeDraft}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {},
): UseSessionStorageReturn<T> {
  const { initializeWithValue = true } = options;

  const serializer = useCallback<(value: T) => string>(
    (value) => {
      if (options.serializer) return options.serializer(value);
      return JSON.stringify(value);
    },
    [options],
  );

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      if (options.deserializer) return options.deserializer(value);
      const defaultValue =
        initialValue instanceof Function ? initialValue() : initialValue;
      if (value === "undefined") return defaultValue;
      try {
        return JSON.parse(value) as T;
      } catch {
        return defaultValue;
      }
    },
    [options, initialValue],
  );

  const readValue = useCallback((): T => {
    const initialValueToUse =
      initialValue instanceof Function ? initialValue() : initialValue;

    if (IS_SERVER) return initialValueToUse;

    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? deserializer(raw) : initialValueToUse;
    } catch {
      return initialValueToUse;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (initializeWithValue) return readValue();
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  const setValue = useEventCallback((value: T | ((prev: T) => T)) => {
    if (IS_SERVER) return;

    try {
      const newValue =
        value instanceof Function ? value(readValue()) : value;
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
