import { useMemo, useState } from "react";

/** Actions returned by useList for manipulating the array immutably. */
export interface UseListActions<T> {
  /** Replaces the entire list with a new array. */
  set: (list: T[]) => void;
  /** Appends one or more items to the end of the list. */
  push: (...items: T[]) => void;
  /** Inserts an item at the specified index. */
  insertAt: (index: number, item: T) => void;
  /** Replaces the item at the specified index. */
  updateAt: (index: number, item: T) => void;
  /** Removes the item at the specified index. */
  removeAt: (index: number) => void;
  /** Empties the list. */
  clear: () => void;
  /** Resets the list to its initial value. */
  reset: () => void;
}

/**
 * Manages array state with a set of immutable helpers (`push`, `insertAt`,
 * `updateAt`, `removeAt`, `clear`, `reset`). Every helper produces a new array,
 * so referential-equality checks and memoization work as expected.
 *
 * @category state
 * @keywords list, array state, push, remove item, insert, todo list
 * @param initial - The initial array state.
 * @returns [0] list - The current array state.
 * @returns [1] actions - Immutable manipulation actions (push, insertAt, updateAt, removeAt, clear,
 *   reset).
 *
 * @example Usage
 * ```tsx
 * import { useList } from "hookli";
 *
 * export function Demo() {
 *   const [list, { push, removeAt, clear, reset }] = useList<string>(["apple", "banana"]);
 *
 *   return (
 *     <div>
 *       <p>Items: {list.join(", ")}</p>
 *       <button onClick={() => push("cherry")}>Push item</button>
 *       <button onClick={() => removeAt(list.length - 1)}>Pop item</button>
 *       <button onClick={clear}>Clear</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
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
