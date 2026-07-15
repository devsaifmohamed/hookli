import { useCallback, useEffect, useState } from "react";
import { useEventListener } from "../use-event-listener";

declare global {
  interface WindowEventMap {
    "local-storage": StorageEvent;
  }
}

const IS_SERVER = typeof window === "undefined";

export interface UseReadLocalStorageOptions<T> {
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
}

/**
 * Reads a `localStorage` key without writing it, re-rendering whenever the value
 * changes in another tab (`storage` event) or via a `local-storage` custom
 * event dispatched in this tab.
 *
 * SSR-safe: returns `null` on the server and, when `initializeWithValue` is
 * false, on the first client render before hydrating from storage.
 *
 * @param key - The `localStorage` key to observe.
 * @param options - Optional custom deserializer and hydration flag.
 * @returns The parsed value, or `null` when the key is absent.
 */
export function useReadLocalStorage<T>(
  key: string,
  options: UseReadLocalStorageOptions<T> = {},
): T | null {
  const { initializeWithValue = true } = options;

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      if (options.deserializer) return options.deserializer(value);
      if (value === "undefined") return undefined as unknown as T;
      try {
        return JSON.parse(value) as T;
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
      return raw ? deserializer(raw) : null;
    } catch {
      return null;
    }
  }, [key, deserializer]);

  const [storedValue, setStoredValue] = useState<T | null>(() => {
    if (initializeWithValue) return readValue();
    return null;
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
  useEventListener("local-storage", handleStorageChange);

  return storedValue;
}
