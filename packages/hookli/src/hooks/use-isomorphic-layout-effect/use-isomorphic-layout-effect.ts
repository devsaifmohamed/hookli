import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` that safely falls back to `useEffect` on the server.
 *
 * `useLayoutEffect` warns when run during server rendering, so this picks the
 * layout effect only when a DOM is present and `useEffect` otherwise. The public
 * signature matches React's `useLayoutEffect`.
 *
 * @category effects
 * @keywords useLayoutEffect, layout effect, ssr warning, server safe layout effect
 *
 * @example Usage
 * ```tsx
 * import { useRef, useState } from "react";
 * import { useIsomorphicLayoutEffect } from "hookli";
 *
 * export function Demo() {
 *   const boxRef = useRef<HTMLDivElement>(null);
 *   const [width, setWidth] = useState(0);
 *
 *   useIsomorphicLayoutEffect(() => {
 *     setWidth(boxRef.current?.offsetWidth ?? 0);
 *   }, []);
 *
 *   return <div ref={boxRef}>Measured: {width}px</div>;
 * }
 * ```
 */
export const useIsomorphicLayoutEffect: typeof useLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
