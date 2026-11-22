import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable getter that reports whether the component is still mounted.
 *
 * Call the returned function inside async callbacks before updating state to
 * avoid the "state update on an unmounted component" pitfall. The getter keeps a
 * stable identity, so it is safe to omit from dependency arrays.
 *
 * @category effects
 * @keywords is mounted, unmounted, async state update, memory leak warning, state update after
 *   unmount, setState on unmounted component
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useIsMounted } from "hookli";
 *
 * const fetchData = () =>
 *   new Promise<string>((resolve) => setTimeout(() => resolve("Loaded!"), 1000));
 *
 * export function Demo() {
 *   const isMounted = useIsMounted();
 *   const [data, setData] = useState<string | null>(null);
 *
 *   async function load() {
 *     const result = await fetchData();
 *     // Skip the update if the component unmounted while waiting.
 *     if (isMounted()) setData(result);
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={load}>Load</button>
 *       <p>{data ?? "Nothing loaded yet"}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useIsMounted = (): (() => boolean) => {
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};
