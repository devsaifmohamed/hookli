import { useEffect, useRef } from "react";

/**
 * A custom hook that calls a callback once after a delay.
 *
 * The latest `callback` is always invoked without restarting the timer, and the
 * timeout is created inside an effect so the hook is SSR-safe and always
 * cleared on cleanup. Passing `null` as `delay` cancels the pending timeout.
 *
 * @param callback - The function to run when the timeout elapses.
 * @param delay - Milliseconds to wait before running, or `null` to cancel.
 */
export const useTimeout = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};
