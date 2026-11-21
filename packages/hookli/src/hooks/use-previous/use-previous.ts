import { useEffect, useRef } from "react";

/**
 * Tracks the value from the previous render.
 *
 * Returns `undefined` on the first render, then — on every render after — the
 * value the hook was called with on the render before. The ref is written in an
 * effect, so it always reflects the last committed value.
 *
 * @category state
 * @keywords previous value, last render value, prev props, previous state, compare old and new
 * @param value - The value to track across renders.
 * @returns previousValue - The value from the previous render (undefined on first render).
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { usePrevious } from "hookli";
 *
 * export function Demo() {
 *   const [count, setCount] = useState(0);
 *   const previousCount = usePrevious(count);
 *
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {previousCount ?? "(none)"}</p>
 *       <button onClick={() => setCount((c) => c + 1)}>Increment</button>
 *       <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
 *       <button onClick={() => setCount(0)}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
