import { useCallback, useEffect, useState } from "react";
import { useEventCallback } from "../use-event-callback";
import { useEventListener } from "../use-event-listener";

declare global {
  interface WindowEventMap {
    "session-storage": StorageEvent;
  }
}

const IS_SERVER = typeof window === "undefined";

export interface UseSessionStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
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
 * @param key - The `sessionStorage` key to read and write.
 * @param initialValue - Fallback value (or factory) when the key is absent.
 * @param options - Optional custom serializer/deserializer and hydration flag.
 * @returns `[value, setValue, removeValue]`.
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
