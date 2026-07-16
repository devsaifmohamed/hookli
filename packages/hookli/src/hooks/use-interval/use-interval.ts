import { useEffect, useRef } from "react";

/**
 * A custom hook that repeatedly calls a callback on a fixed interval.
 *
 * The latest `callback` is always invoked without resetting the timer, and the
 * interval is created inside an effect so the hook is SSR-safe and always
 * cleared on cleanup. Passing `null` as `delay` pauses the interval.
 *
 * @param callback - The function to run on every tick.
 * @param delay - Milliseconds between ticks, or `null` to pause.
 */
export const useInterval = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
