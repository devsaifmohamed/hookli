import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

/**
 * Wraps a function so it keeps a stable identity across renders while always
 * calling the latest version.
 *
 * The returned callback never changes, so it is safe to pass to memoized
 * children or effect dependency arrays without causing re-subscriptions, yet it
 * always invokes the most recent `fn` closure.
 *
 * @category effects
 * @keywords stable callback, latest props, stale closure, useEvent, callback ref
 * @param fn - Calling the returned callback during render throws: use it in event handlers and
 *   effects.
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useEventCallback } from "hookli";
 *
 * export function Demo() {
 *   const [count, setCount] = useState(0);
 *
 *   const readLatest = useEventCallback(() => count);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
 *       <button onClick={() => alert(readLatest())}>Read latest</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useEventCallback = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
): ((...args: Args) => R) => {
  const ref = useRef<typeof fn>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: Args) => ref.current(...args), [ref]);
};
