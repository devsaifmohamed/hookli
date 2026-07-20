import { useEffect, type EffectCallback } from "react";

/**
 * Runs an effect exactly once, on mount. A convenience wrapper around
 * `useEffect(effect, [])` that makes the intent explicit and contains the
 * exhaustive-deps exception in one place.
 *
 * @param effect - Imperative effect callback; may return a cleanup function that
 * runs on unmount.
 */
export const useEffectOnce = (effect: EffectCallback): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
