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
 * @param fn - The function to keep current behind a stable reference.
 * @returns A memoized callback that forwards to the latest `fn`.
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
