import { useEffect, useRef, useState } from "react";
import {
  useDebounceCallback,
  type DebounceOptions,
  type DebouncedState,
} from "../use-debounce-callback";

export type UseDebounceValueReturn<T> = [
  debouncedValue: T,
  setValue: DebouncedState<[value: T | ((prev: T) => T)], void>,
];

/**
 * Tracks a value and returns a debounced copy that only updates after
 * `delayMs` of inactivity.
 *
 * The initial value may be a factory (evaluated once, like `useState`). The
 * returned setter is a debounced function exposing `cancel`, `flush`, and
 * `isPending`; the value equality check can be customised via `options.equalityFn`.
 *
 * @category effects
 * @keywords debounce, debounced value, search input, typing delay, cancel flush
 * @param options - DebounceOptions plus `equalityFn`; when it reports the values equal, the update
 *   is skipped.
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useDebounceValue } from "hookli";
 *
 * export function Demo() {
 *   const [text, setText] = useState("");
 *   const [debounced, setValue] = useDebounceValue("", 500);
 *
 *   return (
 *     <div>
 *       <input
 *         value={text}
 *         onChange={(e) => {
 *           setText(e.target.value);
 *           setValue(e.target.value);
 *         }}
 *       />
 *       <p>Debounced: {debounced}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDebounceValue = <T>(
  initialValue: T | (() => T),
  delayMs: number = 500,
  options: DebounceOptions & { equalityFn?: (left: T, right: T) => boolean } = {},
): UseDebounceValueReturn<T> => {
  const eq = options.equalityFn ?? ((left: T, right: T) => left === right);

  const unwrap = (v: T | (() => T)): T =>
    typeof v === "function" ? (v as () => T)() : v;

  const [debouncedValue, setDebouncedValue] = useState<T>(() =>
    unwrap(initialValue),
  );
  const previousValue = useRef<T>(debouncedValue);

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
