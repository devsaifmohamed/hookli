import { useEffect, useRef } from "react";

/**
 * A custom hook that repeatedly calls a callback on a fixed interval.
 *
 * The latest `callback` is always invoked without resetting the timer, and the
 * interval is created inside an effect so the hook is SSR-safe and always
 * cleared on cleanup. Passing `null` as `delay` pauses the interval.
 *
 * @category effects
 * @keywords setInterval, interval, every n seconds, repeat, polling, periodic, tick
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useInterval } from "hookli";
 *
 * export function Demo() {
 *   const [count, setCount] = useState(0);
 *   const [running, setRunning] = useState(true);
 *
 *   useInterval(() => setCount((prev) => prev + 1), running ? 1000 : null);
 *
 *   return (
 *     <div>
 *       <p>{count}</p>
 *       <button onClick={() => setRunning((prev) => !prev)}>
 *         {running ? "Pause" : "Resume"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
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
