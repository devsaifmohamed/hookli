import { useEffect, useRef } from "react";

/**
 * Tracks the value from the previous render.
 *
 * Returns `undefined` on the first render, then — on every render after — the
 * value the hook was called with on the render before. The ref is written in an
 * effect, so it always reflects the last committed value.
 *
 * @param value - The value to track across renders.
 * @returns The value from the previous render (`undefined` on the first render).
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
