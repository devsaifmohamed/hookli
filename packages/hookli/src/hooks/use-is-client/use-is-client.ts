import { useEffect, useState } from "react";

/**
 * Reports whether the component is running on the client.
 *
 * Returns `false` during server rendering and the initial client render, then
 * flips to `true` after mount. Useful for gating browser-only UI so the server
 * and first client render stay in sync and hydration does not mismatch.
 *
 * @category effects
 * @keywords is client, browser check, hydration, client only, server or client, ssr
 * @returns isClient - false during server rendering and the first hydration pass, then true once
 *   mounted in the browser. Gate browser-only UI on it to keep both renders identical.
 *
 * @example Usage
 * ```tsx
 * import { useIsClient } from "hookli";
 *
 * export function Demo() {
 *   const isClient = useIsClient();
 *
 *   if (!isClient) return <p>Rendering on the server…</p>;
 *
 *   return <p>Now running in the browser.</p>;
 * }
 * ```
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
