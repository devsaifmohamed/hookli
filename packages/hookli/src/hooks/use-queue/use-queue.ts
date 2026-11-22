import { useCallback, useRef, useState } from "react";

export interface UseQueueReturn<T> {
  /** The current queue array, oldest item first. */
  queue: T[];
  add: (item: T) => void;
  /** Dequeues the oldest item and returns it (or undefined if empty). */
  remove: () => T | undefined;
  clear: () => void;
  /** The oldest item at the front of the queue. */
  first: T | undefined;
  /** The newest item at the back of the queue. */
  last: T | undefined;
  size: number;
}

/**
 * Manages a FIFO queue with `add` (enqueue) and `remove` (dequeue) helpers.
 * `remove` returns the item it removed. Every mutation produces a new array.
 *
 * @category state
 * @keywords queue, fifo, enqueue, dequeue, task queue, notifications queue
 *
 * @example Usage
 * ```tsx
 * import { useQueue } from "hookli";
 *
 * export function Demo() {
 *   const { queue, add, remove, clear, first, last, size } = useQueue<string>(["first", "second"]);
 *
 *   return (
 *     <div>
 *       <p>Queue: {queue.join(" -> ")}</p>
 *       <p>Head: {first ?? "(none)"} | Size: {size}</p>
 *       <button onClick={() => add("new-task")}>Enqueue</button>
 *       <button onClick={() => remove()}>Dequeue</button>
 *       <button onClick={clear}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useQueue = <T>(initial: T[] = []): UseQueueReturn<T> => {
  const [queue, setQueue] = useState<T[]>(initial);
  const latest = useRef(queue);
  latest.current = queue;

  const add = useCallback((item: T) => setQueue((q) => [...q, item]), []);
  const remove = useCallback((): T | undefined => {
    const removed = latest.current[0];
    setQueue((q) => q.slice(1));
    return removed;
  }, []);
  const clear = useCallback(() => setQueue([]), []);

  return {
    queue,
    add,
    remove,
    clear,
    first: queue[0],
    last: queue[queue.length - 1],
    size: queue.length,
  };
};
