import { useCallback, useRef, useState } from "react";

export type MutationStatus = "idle" | "loading" | "success" | "error";

export interface UseMutationReturn<TArgs extends unknown[], TData> {
  mutate: (...args: TArgs) => Promise<TData | undefined>;
  status: MutationStatus;
  isLoading: boolean;
  data: TData | null;
  error: Error | null;
  /** Resets status, data, and error back to idle. */
  reset: () => void;
}

/**
 * Runs an async write action (create/update/delete) on demand and tracks its
 * `status`, `data`, and `error` — the write-side companion to {@link useAsync}.
 * `mutate` never throws: on failure it records the error and resolves to
 * `undefined`. State is not set after unmount.
 *
 * @category data
 * @keywords mutation, post request, submit, save to api, create update delete, loading state
 *
 * @example Usage
 * ```tsx
 * import { useMutation } from "hookli";
 *
 * const createUser = async (name: string) => {
 *   const res = await fetch("/api/users", {
 *     method: "POST",
 *     body: JSON.stringify({ name }),
 *   });
 *   return res.json();
 * };
 *
 * export function Demo() {
 *   const { mutate, data, isLoading } = useMutation(createUser);
 *
 *   return (
 *     <div>
 *       <button disabled={isLoading} onClick={() => mutate("Alice")}>
 *         {isLoading ? "Saving..." : "Create User"}
 *       </button>
 *       {data && <p>Created ID: {data.id}</p>}
 *     </div>
 *   );
 * }
 * ```
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
