import { useEffect, useRef } from "react";

/**
 * Runs a cleanup function exactly once, when the component unmounts.
 *
 * The latest `fn` is captured in a ref so the effect can stay mount-scoped
 * (empty dependency array) while still invoking the current closure on unmount.
 *
 * @param fn - The function to call on unmount.
 */
export const useUnmount = (fn: () => void): void => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};
