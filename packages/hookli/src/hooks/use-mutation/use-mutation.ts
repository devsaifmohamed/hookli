import { useCallback, useRef, useState } from "react";

/** The lifecycle status of a {@link useMutation}. */
export type MutationStatus = "idle" | "loading" | "success" | "error";

/**
 * The value returned by {@link useMutation}.
 */
export interface UseMutationReturn<TArgs extends unknown[], TData> {
  /** Run the mutation. Resolves with the data, or `undefined` if it errored. */
  mutate: (...args: TArgs) => Promise<TData | undefined>;
  /** Current lifecycle status. */
  status: MutationStatus;
  /** Convenience flag for `status === "loading"`. */
  isLoading: boolean;
  /** Data from the last successful run, or `null`. */
  data: TData | null;
  /** Error from the last failed run, or `null`. */
  error: Error | null;
  /** Reset back to the idle state. */
  reset: () => void;
}

/**
 * Runs an async write action (create/update/delete) on demand and tracks its
 * `status`, `data`, and `error` — the write-side companion to {@link useAsync}.
 * `mutate` never throws: on failure it records the error and resolves to
 * `undefined`. State is not set after unmount.
 *
 * @param mutationFn - The async function to run when `mutate` is called.
 * @returns `{ mutate, status, isLoading, data, error, reset }`.
 */
export const useMutation = <TArgs extends unknown[], TData>(
  mutationFn: (...args: TArgs) => Promise<TData>,
): UseMutationReturn<TArgs, TData> => {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fnRef = useRef(mutationFn);
  fnRef.current = mutationFn;
  const mounted = useRef(true);

  const mutate = useCallback(async (...args: TArgs) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fnRef.current(...args);
      if (mounted.current) {
        setData(result);
        setStatus("success");
      }
      return result;
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus("error");
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  return { mutate, status, isLoading: status === "loading", data, error, reset };
};
