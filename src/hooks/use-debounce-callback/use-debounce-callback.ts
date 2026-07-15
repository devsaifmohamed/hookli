import { useEffect, useMemo, useRef } from "react";
import { useEventCallback } from "../use-event-callback";
import { useUnmount } from "../use-unmount";

/**
 * Options controlling how {@link useDebounceCallback} schedules invocations.
 */
export interface DebounceOptions {
  /** Invoke on the leading edge of the timeout. Defaults to `false`. */
  leading?: boolean;
  /** Invoke on the trailing edge of the timeout. Defaults to `true`. */
  trailing?: boolean;
  /** The maximum time the callback is allowed to be delayed before it is forced to run. */
  maxWait?: number;
}

/**
 * A debounced function with manual control methods.
 */
export interface DebouncedState<Args extends unknown[], R> {
  (...args: Args): R | undefined;
  /** Cancel any pending trailing invocation. */
  cancel: () => void;
  /** Immediately invoke any pending trailing invocation. */
  flush: () => R | undefined;
  /** Whether a trailing invocation is currently pending. */
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
 * @param fn - The function to debounce.
 * @param delayMs - Milliseconds to wait after the last call. Defaults to `500`.
 * @param options - Leading/trailing edge and `maxWait` behaviour.
 * @returns A debounced callback with `cancel`, `flush`, and `isPending`.
 */
export const useDebounceCallback = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delayMs: number = 500,
  options: DebounceOptions = {},
): DebouncedState<Args, R> => {
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const maxTimeoutId = useRef<ReturnType<typeof setTimeout>>();
  const lastArgs = useRef<Args>();
  const lastResult = useRef<R>();
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
