import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCountdownOptions {
  countStart: number;
  /** Milliseconds between ticks. Defaults to 1000. */
  intervalMs?: number;
  /** Count up instead of down. Defaults to false. */
  isIncrement?: boolean;
  /** The value at which the timer stops itself. Defaults to 0. */
  countStop?: number;
}

export interface UseCountdownActions {
  /** Starts (or resumes) the timer. */
  startCountdown: () => void;
  /** Pauses the timer without resetting the count. */
  stopCountdown: () => void;
  /** Stops the timer and resets the count to countStart. */
  resetCountdown: () => void;
}

/**
 * A custom hook to manage a self-stopping countdown (or count-up) timer.
 *
 * The timer ticks by ±1 every `intervalMs` and stops automatically once it
 * reaches `countStop`. Timers are created inside an effect, so the hook is
 * SSR-safe and every interval is cleared on cleanup.
 *
 * @category state
 * @keywords countdown, timer, seconds left, resend code, otp timer, count down
 * @param options
 *
 * @example Usage
 * ```tsx
 * import { useCountdown } from "hookli";
 *
 * export function Demo() {
 *   const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
 *     countStart: 10,
 *     intervalMs: 1000,
 *   });
 *
 *   return (
 *     <div>
 *       <p>{count}</p>
 *       <button onClick={startCountdown}>Start</button>
 *       <button onClick={stopCountdown}>Pause</button>
 *       <button onClick={resetCountdown}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCountdown = ({
  countStart,
  intervalMs = 1000,
  isIncrement = false,
  countStop = 0,
}: UseCountdownOptions): [count: number, actions: UseCountdownActions] => {
  const [count, setCount] = useState<number>(countStart);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const startCountdown = useCallback(() => setIsRunning(true), []);
  const stopCountdown = useCallback(() => setIsRunning(false), []);
  const resetCountdown = useCallback(() => {
    setIsRunning(false);
    setCount(countStart);
  }, [countStart]);

  const tick = useRef<() => void>(() => {});
  tick.current = () => {
    setCount((prev) => (isIncrement ? prev + 1 : prev - 1));
  };

  useEffect(() => {
    if (isRunning && count === countStop) {
      setIsRunning(false);
    }
  }, [count, countStop, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => tick.current(), intervalMs);
    return () => clearInterval(id);
  }, [isRunning, intervalMs]);

  return [count, { startCountdown, stopCountdown, resetCountdown }];
};
