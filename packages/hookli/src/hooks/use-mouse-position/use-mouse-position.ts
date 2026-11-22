import { RefObject, useEffect, useRef, useState } from "react";

 interface MousePosition {
  x: number | null;
  y: number | null;
}

/**
 * Cursor coordinates within an element.
 *
 * @category dom
 * @keywords mouse position, cursor position, mouse coordinates, pointer x y
 * @returns x - Cursor X relative to the element's left edge; null until the first mousemove.
 *   Updates on every window mousemove, so it can go negative or exceed the element's width.
 * @returns y - Cursor Y relative to the element's top edge; null until the first mousemove.
 *
 * @example Usage
 * ```tsx
 * import { useRef } from "react";
 * import { useMousePosition } from "hookli";
 *
 * export function Demo() {
 *   const panelRef = useRef<HTMLDivElement>(null);
 *   const { x, y } = useMousePosition(panelRef);
 *
 *   return (
 *     <div ref={panelRef} style={{ height: 160 }}>
 *       {x === null || y === null ? (
 *         <p>Move your cursor</p>
 *       ) : (
 *         <p>
 *           {Math.round(x)} × {Math.round(y)}
 *         </p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useMousePosition = <T extends HTMLElement>(
  ref: React.Ref<T>
): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if ((ref as RefObject<HTMLElement>).current) {
        const { left, top } = (
          ref as RefObject<HTMLElement>
        )?.current?.getBoundingClientRect() as DOMRect;
        setMousePosition({ x: clientX - left, y: clientY - top });
      }
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [ref]);

  return mousePosition;
};
