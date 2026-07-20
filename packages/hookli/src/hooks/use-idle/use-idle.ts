import { useEffect, useState } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Reports whether the user has been idle (no activity) for at least `ms`
 * milliseconds. Any mouse/keyboard/touch/scroll activity resets the timer.
 * Listeners attach in an effect, so it is SSR-safe.
 *
 * @param ms - Inactivity threshold in milliseconds. Defaults to `60000` (1 min).
 * @returns `true` once the user has been idle for `ms`, `false` while active.
 */
export const useIdle = (ms: number = 60_000): boolean => {
  const [idle, setIdle] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const reset = () => {
      setIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIdle(true), ms);
    };

    reset();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true });
    }
    return () => {
      clearTimeout(timeoutId);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset);
      }
    };
  }, [ms]);

  return idle;
};
