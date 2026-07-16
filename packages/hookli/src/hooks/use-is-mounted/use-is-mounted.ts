import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable getter that reports whether the component is still mounted.
 *
 * Call the returned function inside async callbacks before updating state to
 * avoid the "state update on an unmounted component" pitfall. The getter keeps a
 * stable identity, so it is safe to omit from dependency arrays.
 *
 * @returns A function that returns `true` while mounted and `false` after unmount.
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
