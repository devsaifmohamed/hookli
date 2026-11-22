import { useEffect, useMemo, useRef } from "react";
import { useEventCallback } from "../use-event-callback";
import { useUnmount } from "../use-unmount";

export interface DebounceOptions {
  /**
   * Invoke on the leading edge — run once immediately on the first call of a burst. Defaults to
   * `false`.
   */
  leading?: boolean;
  /** Invoke on the trailing edge — run after the burst settles. Defaults to `true`. */
  trailing?: boolean;
  /**
   * The maximum time the callback may be delayed before it is forced to run, even during a
   * continuous burst.
   */
  maxWait?: number;
}

export interface DebouncedState<Args extends unknown[], R> {
  /** Calling it schedules an invocation and returns the last computed result — undefined before the first run. */
  (...args: Args): R | undefined;
  cancel: () => void;
  /** Immediately runs any pending invocation and returns its result. */
  flush: () => R | undefined;
  isPending: () => boolean;
}

/**
 * Creates a debounced version of `fn` that delays invoking it until `delayMs`
 * have elapsed since the last call.
 *
 * The returned function keeps a stable identity across renders while always
 * invoking the latest `fn`, and exposes `cancel`, `flush`, and `isPending` for
 * manual control. Any pending invocation is cancelled on unmount, so the hook
 * is SSR-safe (no timer is scheduled until the debounced function is called).
 *
 * @category effects
 * @keywords debounce function, debounced callback, debounce handler, resize handler, autosave, rate
 *   limit calls
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useDebounceCallback } from "hookli";
 *
 * export function Demo() {
 *   const [query, setQuery] = useState("");
 *
 *   const search = useDebounceCallback((q: string) => {
 *     console.log("searching", q);
 *   }, 600);
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => {
 *         setQuery(e.target.value);
 *         search(e.target.value);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const useDebounceCallback = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delayMs: number = 500,
  options: DebounceOptions = {},
): DebouncedState<Args, R> => {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const maxTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastArgs = useRef<Args | undefined>(undefined);
  const lastResult = useRef<R | undefined>(undefined);
  const lastInvokeTime = useRef<number>(0);

  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maxWait = options.maxWait;

  const latestFn = useEventCallback(fn);

  useEffect(() => {
    lastInvokeTime.current = 0;
  }, [delayMs, leading, trailing, maxWait]);

  const debounced = useMemo(() => {
    const invoke = (): R | undefined => {
      const args = lastArgs.current;
      if (!args) return undefined;
      lastArgs.current = undefined;
      lastInvokeTime.current = Date.now();
      lastResult.current = latestFn(...args);
      return lastResult.current;
    };

    const clearTimers = (): void => {
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      if (maxTimeoutId.current !== undefined) {
        clearTimeout(maxTimeoutId.current);
        maxTimeoutId.current = undefined;
      }
    };

    const trailingEdge = (): void => {
      clearTimers();
      if (trailing && lastArgs.current) {
        invoke();
      } else {
        lastArgs.current = undefined;
      }
    };

    const state: DebouncedState<Args, R> = Object.assign(
      (...args: Args): R | undefined => {
        lastArgs.current = args;

        const isFirstCall =
          timeoutId.current === undefined &&
          maxTimeoutId.current === undefined;

        if (timeoutId.current !== undefined) {
          clearTimeout(timeoutId.current);
        }

        if (leading && isFirstCall) {
          invoke();
        }

        timeoutId.current = setTimeout(trailingEdge, delayMs);

        if (maxWait !== undefined && maxTimeoutId.current === undefined) {
          maxTimeoutId.current = setTimeout(() => {
            clearTimers();
            if (lastArgs.current) invoke();
          }, maxWait);
        }

        return lastResult.current;
      },
      {
        cancel: (): void => {
          clearTimers();
          lastArgs.current = undefined;
        },
        flush: (): R | undefined => {
          if (timeoutId.current === undefined) return lastResult.current;
          clearTimers();
          return lastArgs.current ? invoke() : lastResult.current;
        },
        isPending: (): boolean =>
          timeoutId.current !== undefined && lastArgs.current !== undefined,
      },
    );

    return state;
  }, [delayMs, leading, trailing, maxWait, latestFn]);

  useUnmount(() => {
    debounced.cancel();
  });

  return debounced;
};
