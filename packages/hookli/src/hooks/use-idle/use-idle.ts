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
 * @category dom
 * @keywords idle, inactive, inactivity, afk, away, auto logout, session timeout
 *
 * @example Usage
 * ```tsx
 * import { useIdle } from "hookli";
 *
 * export function Demo() {
 *   const isIdle = useIdle(5000);
 *
 *   return (
 *     <div>
 *       <p>User is: {isIdle ? "Idle" : "Active"}</p>
 *     </div>
 *   );
 * }
 * ```
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
