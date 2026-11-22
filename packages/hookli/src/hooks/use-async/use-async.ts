import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncReturn<T> {
  loading: boolean;
  error: Error | null;
  value: T | null;
  execute: () => Promise<void>;
}

/**
 * Runs an async function and tracks its `{ loading, error, value }` state. By
 * default it runs on mount; pass `immediate = false` to run it only via the
 * returned `execute`. State is never set after unmount, so it won't leak or warn.
 *
 * @category data
 * @keywords async, promise, loading error data, async function, data loading, await
 *
 * @example Usage
 * ```tsx
 * import { useAsync } from "hookli";
 *
 * const fetchData = async () => {
 *   const res = await fetch("https://api.example.com/data");
 *   return res.json();
 * };
 *
 * export function Demo() {
 *   const { value, loading, error, execute } = useAsync(fetchData);
 *
 *   if (loading) return <p>Loading...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <pre>{JSON.stringify(value, null, 2)}</pre>
 *       <button onClick={execute}>Reload</button>
 *     </div>
 *   );
 * }
 * ```
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
