import { useEffect, useRef, useState } from "react";
import {
  useDebounceCallback,
  type DebounceOptions,
  type DebouncedState,
} from "../use-debounce-callback";

/**
 * The tuple returned by {@link useDebounceValue}: the debounced value and a
 * setter, plus the underlying debounced updater for manual control.
 */
export type UseDebounceValueReturn<T> = [
  T,
  DebouncedState<[value: T | ((prev: T) => T)], void>,
];

/**
 * Tracks a value and returns a debounced copy that only updates after
 * `delayMs` of inactivity.
 *
 * The initial value may be a factory (evaluated once, like `useState`). The
 * returned setter is a debounced function exposing `cancel`, `flush`, and
 * `isPending`; the value equality check can be customised via `options.equalityFn`.
 *
 * @param initialValue - The starting value or a factory producing it.
 * @param delayMs - Milliseconds of inactivity before the debounced value updates.
 * @param options - Debounce edge options plus an optional `equalityFn`.
 * @returns `[debouncedValue, setValue]` where `setValue` also carries `cancel`/`flush`/`isPending`.
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
