import { useEffect, useState } from "react";

interface UseLocalStorageWithExpiryState<T> {
  value: T | null;
  setStoredValue: (newValue: T) => void;
}

interface StoredItem<T> {
  value: T;
  expiry: number;
}

export const useLocalStorageWithExpiry = <T>(
  key: string,
  initialValue: T,
  expiryMs: number
): UseLocalStorageWithExpiryState<T> => {
  // Read the wrapper, returning the INNER value — or null once expired/absent.
  const read = (): T | null => {
    if (typeof window === "undefined") return initialValue;
    const raw = window.localStorage.getItem(key);
    if (!raw) return initialValue;
    try {
      const item = JSON.parse(raw) as StoredItem<T>;
      if (item && typeof item.expiry === "number" && Date.now() > item.expiry) {
        window.localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T | null>(initialValue);

  // Hydrate from storage on the client (SSR renders `initialValue`, then this syncs).
  useEffect(() => {
    setValue(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (typeof window === "undefined") return;
    const item: StoredItem<T> = {
      value: newValue,
      expiry: Date.now() + expiryMs,
    };
    window.localStorage.setItem(key, JSON.stringify(item));
  };

  return { value, setStoredValue };
};
