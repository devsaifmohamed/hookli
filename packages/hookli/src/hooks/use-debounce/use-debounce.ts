import { useEffect, useState } from "react";

/**
 * Debounces a changing value.
 *
 * @category effects
 * @keywords debounce, typing delay, search as you type, wait until typing stops, delay value
 * @param delay - Milliseconds the value must stay unchanged before the debounced value updates.
 * @returns debouncedValue - Trails the input value, updating only after delay ms without a change.
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useDebounce } from "hookli";
 *
 * export function Demo() {
 *   const [text, setText] = useState("");
 *   const debounced = useDebounce(text, 500);
 *
 *   return (
 *     <div>
 *       <input value={text} onChange={(e) => setText(e.target.value)} />
 *       <p>Value: {text}</p>
 *       <p>Debounced: {debounced}</p>
 *     </div>
 *   );
 * }
 * ```
 */
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
