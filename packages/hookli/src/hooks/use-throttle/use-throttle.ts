import { useEffect, useRef, useState } from "react";

/**
 * Throttles a fast-changing value: the returned value updates at most once every
 * `interval` milliseconds. A trailing update is scheduled so the latest value is
 * never dropped. The timer lives inside an effect, so the hook is SSR-safe and
 * cleans up on unmount.
 *
 * The twin of {@link useDebounce} — throttle emits on a steady cadence while the
 * value keeps changing; debounce waits for the changes to stop.
 *
 * @param value - The value to throttle.
 * @param interval - Minimum time between updates, in milliseconds. Defaults to `500`.
 * @returns The throttled value.
 */
export const useThrottle = <T>(value: T, interval: number = 500): T => {
  const [throttled, setThrottled] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastRan.current);

    if (remaining <= 0) {
      lastRan.current = now;
      setThrottled(value);
      return;
    }

    const id = setTimeout(() => {
      lastRan.current = Date.now();
      setThrottled(value);
    }, remaining);
    return () => clearTimeout(id);
  }, [value, interval]);

  return throttled;
};
