import { Dispatch, SetStateAction, useCallback, useState } from "react";

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  /** Back to `initialValue`. */
  reset: () => void;
  setCount: Dispatch<SetStateAction<number>>;
}

/**
 * A custom hook to manage a numeric counter.
 *
 * @category state
 * @keywords counter, increment, decrement, count, number state, quantity
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
