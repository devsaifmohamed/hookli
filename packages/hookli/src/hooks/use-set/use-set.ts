import { useMemo, useRef, useState } from "react";

/** Actions returned by useSet for manipulating the Set immutably. */
export interface UseSetActions<T> {
  /** Adds a value to the set. */
  add: (value: T) => void;
  /** Removes a value from the set. */
  remove: (value: T) => void;
  /** Adds the value if absent, removes it if present. */
  toggle: (value: T) => void;
  /** Returns whether the value is currently in the set. */
  has: (value: T) => boolean;
  /** Empties the set. */
  clear: () => void;
  /** Resets the set to its initial values. */
  reset: () => void;
}

/**
 * Manages `Set` state with immutable helpers (`add`, `remove`, `toggle`, `has`,
 * `clear`, `reset`). Mutating helpers create a new `Set` so React re-renders,
 * and `add`/`remove` return the previous set unchanged when nothing changes to
 * avoid needless renders. `has` always reads the latest value.
 *
 * @category state
 * @keywords Set, unique values, selected ids, toggle selection, set state
 * @param initial - Optional initial values to populate the Set with.
 * @returns [0] set - The current Set state.
 * @returns [1] actions - Immutable set manipulation actions (add, remove, toggle, has, clear,
 *   reset).
 *
 * @example Usage
 * ```tsx
 * import { useSet } from "hookli";
 *
 * export function Demo() {
 *   const [set, { add, remove, toggle, clear, reset }] = useSet<string>(["react"]);
 *
 *   return (
 *     <div>
 *       <p>Selected: {Array.from(set).join(", ")}</p>
 *       <button onClick={() => toggle("typescript")}>Toggle typescript</button>
 *       <button onClick={() => add("nextjs")}>Add nextjs</button>
 *       <button onClick={() => remove("react")}>Remove react</button>
 *       <button onClick={clear}>Clear</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
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
