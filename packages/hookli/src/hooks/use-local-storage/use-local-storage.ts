import { useEffect, useState } from "react";

interface UseLocalStorageResponse<T> {
  value: T;
  setStoredValue: (value: T | ((val: T) => T)) => void;
}

/**
 * State persisted to localStorage.
 *
 * @category state
 * @keywords localStorage, persist state, save across reloads, remember, user preferences, settings,
 *   survive refresh
 * @param initialValue - Value used before hydration and when the key is empty. Prefer a stable
 *   reference — the sync effect depends on it.
 * @returns value - The stored value. Server-rendered as initialValue, then synced from localStorage
 *   after mount.
 *
 * @example Usage
 * ```tsx
 * import { useLocalStorage } from "hookli";
 *
 * export function Demo() {
 *   const { value, setStoredValue } = useLocalStorage("note", "");
 *
 *   return (
 *     <div>
 *       <input value={value} onChange={(e) => setStoredValue(e.target.value)} />
 *       <button type="button" onClick={() => setStoredValue("")}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageResponse<T> => {
  // State to store our value
  const [value, setValue] = useState<T>(initialValue);

  // Get from local storage only during initial render
  useEffect(() => {
    // Parse stored json or return initialValue
    const item = window.localStorage.getItem(key);
    const parsedValue: T = item ? JSON.parse(item) : initialValue;
    setValue(parsedValue);
  }, [key, initialValue]); // Only re-run on change in `key` or `initialValue`

  // Return a wrapper function that provides access to the stored value
  // and a setter function to update it
  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    // Allow value to be a function so we have same API as useState
    const updatedValue =
      newValue instanceof Function ? newValue(value) : newValue;

    // Save to local storage
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
    setValue(updatedValue);
  };

  return { value, setStoredValue };
};
