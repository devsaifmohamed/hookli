import { useMemo, useState } from "react";

/**
 * Actions returned by {@link useList} for manipulating the array immutably.
 */
export interface UseListActions<T> {
  /** Replace the whole list. */
  set: (list: T[]) => void;
  /** Append one or more items to the end. */
  push: (...items: T[]) => void;
  /** Insert an item at `index`, shifting the rest right. */
  insertAt: (index: number, item: T) => void;
  /** Replace the item at `index`. */
  updateAt: (index: number, item: T) => void;
  /** Remove the item at `index`. */
  removeAt: (index: number) => void;
  /** Empty the list. */
  clear: () => void;
  /** Reset to the initial list the hook was created with. */
  reset: () => void;
}

/**
 * Manages array state with a set of immutable helpers (`push`, `insertAt`,
 * `updateAt`, `removeAt`, `clear`, `reset`). Every helper produces a new array,
 * so referential-equality checks and memoization work as expected.
 *
 * @param initial - The initial array. Defaults to `[]`.
 * @returns A tuple of `[list, actions]`.
 */
export const useList = <T>(initial: T[] = []): [T[], UseListActions<T>] => {
  const [list, setList] = useState<T[]>(initial);

  const actions = useMemo<UseListActions<T>>(
    () => ({
      set: (next) => setList(next),
      push: (...items) => setList((prev) => [...prev, ...items]),
      insertAt: (index, item) =>
        setList((prev) => {
          const next = prev.slice();
          next.splice(index, 0, item);
          return next;
        }),
      updateAt: (index, item) =>
        setList((prev) => prev.map((value, i) => (i === index ? item : value))),
      removeAt: (index) =>
        setList((prev) => prev.filter((_, i) => i !== index)),
      clear: () => setList([]),
      reset: () => setList(initial),
    }),
    // `initial` is intentionally captured once (reset restores the original list).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [list, actions];
};
