import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options for {@link useCountdown}.
 */
export interface UseCountdownOptions {
  /** The value the countdown starts from. */
  countStart: number;
  /** Milliseconds between ticks. Defaults to `1000`. */
  intervalMs?: number;
  /** Count up instead of down. Defaults to `false`. */
  isIncrement?: boolean;
  /** The value at which the countdown stops. Defaults to `0`. */
  countStop?: number;
}

/**
 * The controls returned as the second tuple element of {@link useCountdown}.
 */
export interface UseCountdownActions {
  /** Start (or resume) the countdown. */
  startCountdown: () => void;
  /** Pause the countdown. */
  stopCountdown: () => void;
  /** Stop and reset the count back to `countStart`. */
  resetCountdown: () => void;
}

/**
 * A custom hook to manage a self-stopping countdown (or count-up) timer.
 *
 * The timer ticks by ±1 every `intervalMs` and stops automatically once it
 * reaches `countStop`. Timers are created inside an effect, so the hook is
 * SSR-safe and every interval is cleared on cleanup.
 *
 * @param options - See {@link UseCountdownOptions}.
 * @returns A tuple of the current count and a controls object.
 */
export const useCountdown = ({
  countStart,
  intervalMs = 1000,
  isIncrement = false,
  countStop = 0,
}: UseCountdownOptions): [number, UseCountdownActions] => {
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
