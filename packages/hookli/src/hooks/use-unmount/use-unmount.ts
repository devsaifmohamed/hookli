import { useEffect, useRef } from "react";

/**
 * Runs a cleanup function exactly once, when the component unmounts.
 *
 * The latest `fn` is captured in a ref so the effect can stay mount-scoped
 * (empty dependency array) while still invoking the current closure on unmount.
 *
 * @category effects
 * @keywords unmount, cleanup, on destroy, teardown, component removed
 *
 * @example Usage
 * ```tsx
 * import { useUnmount } from "hookli";
 *
 * export function Demo() {
 *   useUnmount(() => {
 *     console.log("cleanup on unmount");
 *   });
 *
 *   return <p>Watch the console when I unmount.</p>;
 * }
 * ```
 */
export const useUnmount = (fn: () => void): void => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};
