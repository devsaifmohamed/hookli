import { useState } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

const IS_SERVER = typeof window === "undefined";

/**
 * Options accepted by {@link useMediaQuery}.
 */
export interface UseMediaQueryOptions {
  /** Value returned on the server and before hydration. Defaults to `false`. */
  defaultValue?: boolean;
  /** Read the real match synchronously on mount. Defaults to `true`. */
  initializeWithValue?: boolean;
}

/**
 * Tracks whether a CSS media query currently matches.
 *
 * SSR-safe: on the server (or when `initializeWithValue` is false) the hook
 * starts from `defaultValue` and reconciles with `window.matchMedia` after
 * mount. The `change` listener is attached inside a layout effect and removed
 * on cleanup.
 *
 * @param query - The media query string, e.g. `"(min-width: 768px)"`.
 * @param options - Optional server default and hydration flag.
 * @returns `true` when the query matches, otherwise `false`.
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  const getMatches = (query: string): boolean => {
    if (IS_SERVER) return defaultValue;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) return getMatches(query);
    return defaultValue;
  });

  useIsomorphicLayoutEffect(() => {
    if (IS_SERVER) return;

    const matchMedia = window.matchMedia(query);

    const handleChange = () => {
      setMatches(matchMedia.matches);
    };

    handleChange();
    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
