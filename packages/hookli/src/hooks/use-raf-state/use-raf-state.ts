import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

/**
 * A `useState` whose updates are batched to the next animation frame. Useful for
 * high-frequency values (scroll, pointer, resize) so React re-renders at most
 * once per frame. Any pending frame is cancelled on unmount.
 *
 * @param initialState - Initial state, or a lazy initializer.
 * @returns A `[state, setState]` tuple, same shape as `useState`.
 */
export const useRafState = <T>(
  initialState: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialState);
  const frame = useRef<number | null>(null);

  const setRafState = useCallback((value: SetStateAction<T>) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setState(value);
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return [state, setRafState];
};
