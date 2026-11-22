import { useEffect, useState } from "react";

interface UseFetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Declarative fetch with loading and error status.
 *
 * @category data
 * @keywords fetch, http get, load json, api request, data fetching, get data from url
 * @param url - The endpoint to GET. The request starts on mount and re-runs whenever the url
 *   changes.
 * @returns data - The parsed JSON body; null until the first request succeeds. Kept from the
 *   previous url while a refetch is in flight.
 * @returns error - Set on network failure or a non-ok response ("HTTP error! status: 404"). Never
 *   cleared by later requests — remount the component (e.g. key={url}) for fresh state.
 * @returns loading - True until the first request settles. Not reset to true when the url changes —
 *   remount for a per-request loading flag.
 *
 * @example Usage
 * ```tsx
 * import { useFetch } from "hookli";
 *
 * type Post = { id: number; title: string; body: string };
 *
 * export function Demo() {
 *   const { data, loading, error } = useFetch<Post>(
 *     "https://jsonplaceholder.typicode.com/posts/1",
 *   );
 *
 *   if (loading) return <p>Loading…</p>;
 *   if (error) return <p>Request failed: {error.message}</p>;
 *
 *   return <article>{data?.title}</article>;
 * }
 * ```
 */
export const useFetch = <T>(url: string): UseFetchResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};
