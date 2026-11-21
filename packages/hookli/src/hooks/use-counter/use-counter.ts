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
 * @category state
 * @keywords counter, increment, decrement, count, number state, quantity
 * @param initialValue - The count the hook starts from; reset returns here.
 * @returns count - The current count.
 * @returns increment - Adds one to the count.
 * @returns decrement - Subtracts one from the count.
 * @returns reset - Restores the count to initialValue.
 * @returns setCount - Sets the count directly; accepts a value or an updater function.
 *
 * @example Usage
 * ```tsx
 * import { useCounter } from "hookli";
 *
 * export function Demo() {
 *   const { count, increment, decrement, reset, setCount } = useCounter(0);
 *
 *   return (
 *     <div>
 *       <p>{count}</p>
 *       <button onClick={decrement}>-1</button>
 *       <button onClick={increment}>+1</button>
 *       <button onClick={() => setCount(10)}>Set 10</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => setCount((prev) => prev + 1), []);
  const decrement = useCallback(() => setCount((prev) => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset, setCount };
};
