import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The state returned by {@link useAsync}.
 */
export interface UseAsyncReturn<T> {
  /** Whether the async function is currently running. */
  loading: boolean;
  /** The error thrown by the last run, or `null`. */
  error: Error | null;
  /** The value resolved by the last successful run, or `null`. */
  value: T | null;
  /** Run the async function again. */
  execute: () => Promise<void>;
}

/**
 * Runs an async function and tracks its `{ loading, error, value }` state. By
 * default it runs on mount; pass `immediate = false` to run it only via the
 * returned `execute`. State is never set after unmount, so it won't leak or warn.
 *
 * @param asyncFunction - The async function to run.
 * @param immediate - Run on mount. Defaults to `true`.
 * @returns `{ loading, error, value, execute }`.
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
): UseAsyncReturn<T> => {
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState<T | null>(null);

  const fnRef = useRef(asyncFunction);
  fnRef.current = asyncFunction;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mounted.current) setValue(result);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) void execute();
  }, [execute, immediate]);

  return { loading, error, value, execute };
};
