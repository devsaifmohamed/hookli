import { useEffect, useState } from "react";

export interface WindowScrollPosition {
  /** Horizontal scroll offset in pixels (`window.scrollX`). */
  x: number;
  /** Vertical scroll offset in pixels (`window.scrollY`). */
  y: number;
}

/**
 * Tracks the window's scroll position reactively. The listener is registered in
 * an effect (SSR-safe) and marked `passive` for scroll performance. Both values
 * start at `0` and update on every scroll.
 *
 * @category dom
 * @keywords scroll position, scrollY, page scroll, scrolled down, sticky header, back to top
 *
 * @example Usage
 * ```tsx
 * import { useWindowScroll } from "hookli";
 *
 * export function Demo() {
 *   const { x, y } = useWindowScroll();
 *
 *   return (
 *     <div>
 *       <p>Scroll X: {x}px</p>
 *       <p>Scroll Y: {y}px</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useWindowScroll = (): WindowScrollPosition => {
  const [position, setPosition] = useState<WindowScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () =>
      setPosition({ x: window.scrollX, y: window.scrollY });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return position;
};
