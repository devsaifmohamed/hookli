import { useMemo, useRef, useState } from "react";

/**
 * Actions returned by {@link useSet} for manipulating the Set immutably.
 */
export interface UseSetActions<T> {
  /** Add a value (no-op if already present). */
  add: (value: T) => void;
  /** Remove a value (no-op if absent). */
  remove: (value: T) => void;
  /** Add the value if missing, remove it if present. */
  toggle: (value: T) => void;
  /** Whether the value is currently in the set (reads the latest set). */
  has: (value: T) => boolean;
  /** Empty the set. */
  clear: () => void;
  /** Reset to the initial values the hook was created with. */
  reset: () => void;
}

/**
 * Manages `Set` state with immutable helpers (`add`, `remove`, `toggle`, `has`,
 * `clear`, `reset`). Mutating helpers create a new `Set` so React re-renders,
 * and `add`/`remove` return the previous set unchanged when nothing changes to
 * avoid needless renders. `has` always reads the latest value.
 *
 * @param initial - Initial values (any iterable). Defaults to empty.
 * @returns A tuple of `[set, actions]`.
 */
export const useSet = <T>(initial?: Iterable<T>): [Set<T>, UseSetActions<T>] => {
  const [set, setSet] = useState<Set<T>>(() => new Set(initial));
  const latest = useRef(set);
  latest.current = set;

  const actions = useMemo<UseSetActions<T>>(
    () => ({
      add: (value) =>
        setSet((prev) => (prev.has(value) ? prev : new Set(prev).add(value))),
      remove: (value) =>
        setSet((prev) => {
          if (!prev.has(value)) return prev;
          const next = new Set(prev);
          next.delete(value);
          return next;
        }),
      toggle: (value) =>
        setSet((prev) => {
          const next = new Set(prev);
          if (next.has(value)) next.delete(value);
          else next.add(value);
          return next;
        }),
      has: (value) => latest.current.has(value),
      clear: () => setSet(new Set()),
      reset: () => setSet(new Set(initial)),
    }),
    // `initial` is intentionally captured once (reset restores the original set).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [set, actions];
};
