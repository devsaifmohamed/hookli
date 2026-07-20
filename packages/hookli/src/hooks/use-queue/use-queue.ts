import { useCallback, useRef, useState } from "react";

/** The value returned by {@link useQueue}. */
export interface UseQueueReturn<T> {
  /** The current queue, oldest item first. */
  queue: T[];
  /** Enqueue an item at the end. */
  add: (item: T) => void;
  /** Dequeue the oldest item and return it (`undefined` if empty). */
  remove: () => T | undefined;
  /** Empty the queue. */
  clear: () => void;
  /** The oldest item (next to be removed), or `undefined`. */
  first: T | undefined;
  /** The newest item, or `undefined`. */
  last: T | undefined;
  /** Number of items in the queue. */
  size: number;
}

/**
 * Manages a FIFO queue with `add` (enqueue) and `remove` (dequeue) helpers.
 * `remove` returns the item it removed. Every mutation produces a new array.
 *
 * @param initial - Initial items. Defaults to `[]`.
 * @returns `{ queue, add, remove, clear, first, last, size }`.
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
