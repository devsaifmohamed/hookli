import { useEffect, useState } from "react";

/**
 * Reports whether the component is running on the client.
 *
 * Returns `false` during server rendering and the initial client render, then
 * flips to `true` after mount. Useful for gating browser-only UI so the server
 * and first client render stay in sync and hydration does not mismatch.
 *
 * @returns `true` once mounted on the client, otherwise `false`.
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
