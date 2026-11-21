import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

/**
 * A `useState` whose updates are batched to the next animation frame. Useful for
 * high-frequency values (scroll, pointer, resize) so React re-renders at most
 * once per frame. Any pending frame is cancelled on unmount.
 *
 * @category state
 * @keywords requestAnimationFrame, raf, animation frame, smooth updates, frame batched state
 * @param initialState - The initial state or lazy initializer function.
 * @returns [0] state - The current state value.
 * @returns [1] setState - State setter whose updates are batched to requestAnimationFrame.
 *
 * @example Usage
 * ```tsx
 * import { useRafState } from "hookli";
 *
 * export function Demo() {
 *   const [pos, setPos] = useRafState({ x: 0, y: 0 });
 *
 *   return (
 *     <div
 *       onPointerMove={(e) => {
 *         setPos({ x: e.clientX, y: e.clientY });
 *       }}
 *     >
 *       <p>Position: {pos.x}, {pos.y}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useRafState = <T>(
  initialState: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialState);
  const frame = useRef<number | null>(null);

  const setRafState = useCallback((value: SetStateAction<T>) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setState(value);
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return [state, setRafState];
};
