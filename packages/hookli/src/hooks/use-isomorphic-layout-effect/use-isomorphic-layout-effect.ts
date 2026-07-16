import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` that safely falls back to `useEffect` on the server.
 *
 * `useLayoutEffect` warns when run during server rendering, so this picks the
 * layout effect only when a DOM is present and `useEffect` otherwise. The public
 * signature matches React's `useLayoutEffect`.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
