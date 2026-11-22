import { useEffect, useRef } from "react";

/**
 * A custom hook that calls a callback once after a delay.
 *
 * The latest `callback` is always invoked without restarting the timer, and the
 * timeout is created inside an effect so the hook is SSR-safe and always
 * cleared on cleanup. Passing `null` as `delay` cancels the pending timeout.
 *
 * @category effects
 * @keywords setTimeout, timeout, delay, after delay, run later, once after
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useTimeout } from "hookli";
 *
 * export function Demo() {
 *   const [visible, setVisible] = useState(false);
 *   const [delay, setDelay] = useState<number | null>(null);
 *
 *   useTimeout(() => {
 *     setVisible(true);
 *     setDelay(null);
 *   }, delay);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setDelay(2000)}>Reveal in 2s</button>
 *       {visible && <p>Here!</p>}
 *     </div>
 *   );
 * }
 * ```
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
