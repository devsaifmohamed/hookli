import { useMemo, useState } from "react";

export interface UseListActions<T> {
  set: (list: T[]) => void;
  push: (...items: T[]) => void;
  insertAt: (index: number, item: T) => void;
  updateAt: (index: number, item: T) => void;
  removeAt: (index: number) => void;
  clear: () => void;
  /** Back to the initial list. */
  reset: () => void;
}

/**
 * Manages array state with a set of immutable helpers (`push`, `insertAt`,
 * `updateAt`, `removeAt`, `clear`, `reset`). Every helper produces a new array,
 * so referential-equality checks and memoization work as expected.
 *
 * @category state
 * @keywords list, array state, push, remove item, insert, todo list
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
export const useList = <T>(initial: T[] = []): [list: T[], actions: UseListActions<T>] => {
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
