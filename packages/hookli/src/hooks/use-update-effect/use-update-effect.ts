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
 * @param effect - Imperative effect callback; may return a cleanup function.
 * @param deps - Dependency list, with the same semantics as `useEffect`.
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
