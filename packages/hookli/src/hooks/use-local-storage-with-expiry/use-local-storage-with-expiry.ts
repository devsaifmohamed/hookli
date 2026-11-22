import { useEffect, useState } from "react";

interface UseLocalStorageWithExpiryState<T> {
  value: T | null;
  setStoredValue: (newValue: T) => void;
}

interface StoredItem<T> {
  value: T;
  expiry: number;
}

/**
 * Persisted state with a TTL.
 *
 * @category state
 * @keywords localStorage, expire, ttl, time to live, cache with expiry, expiring storage
 * @param expiryMs - Time-to-live in milliseconds. Every write stores the value with a fresh expiry
 *   timestamp.
 * @returns value - The stored value, or null once the item has expired. Expiry is checked when the
 *   hook reads — on mount or key change — at which point the item is removed.
 * @returns setStoredValue - Persists the value to localStorage with a new expiry of now + expiryMs.
 *
 * @example Usage
 * ```tsx
 * import { useLocalStorageWithExpiry } from "hookli";
 *
 * export function Demo() {
 *   const { value, setStoredValue } = useLocalStorageWithExpiry(
 *     "draft",
 *     "",
 *     10_000,
 *   );
 *
 *   return (
 *     <div>
 *       <button onClick={() => setStoredValue("hello")}>Save for 10s</button>
 *       <p>{value === null ? "Expired" : value || "Nothing stored"}</p>
 *     </div>
 *   );
 * }
 * ```
 */
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
