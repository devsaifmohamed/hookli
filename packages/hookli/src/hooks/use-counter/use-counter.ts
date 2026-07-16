import { Dispatch, SetStateAction, useCallback, useState } from "react";

/**
 * The count and actions returned by {@link useCounter}.
 */
export interface UseCounterReturn {
  /** The current count. */
  count: number;
  /** Increment the count by one. */
  increment: () => void;
  /** Decrement the count by one. */
  decrement: () => void;
  /** Reset the count back to its initial value. */
  reset: () => void;
  /** Set the count directly (accepts a value or updater function). */
  setCount: Dispatch<SetStateAction<number>>;
}

/**
 * A custom hook to manage a numeric counter.
 *
 * @param initialValue - The initial count. Defaults to `0`.
 * @returns An object with the current `count` and actions `increment`, `decrement`, `reset`, and `setCount`.
 */
export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => setCount((prev) => prev + 1), []);
  const decrement = useCallback(() => setCount((prev) => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset, setCount };
};
