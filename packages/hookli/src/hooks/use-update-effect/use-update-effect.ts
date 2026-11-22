import {
  useEffect,
  useRef,
  type DependencyList,
  type EffectCallback,
} from "react";

/**
 * A variant of `useEffect` that **skips the initial mount** and only runs on
 * subsequent dependency changes. Handy for reacting to updates without the
 * effect firing once on first render.
 *
 * @category effects
 * @keywords skip first render, update only, componentDidUpdate, not on mount
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useUpdateEffect } from "hookli";
 *
 * export function Demo() {
 *   const [count, setCount] = useState(0);
 *
 *   useUpdateEffect(() => {
 *     console.log("Count changed to:", count);
 *   }, [count]);
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => setCount((c) => c + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
