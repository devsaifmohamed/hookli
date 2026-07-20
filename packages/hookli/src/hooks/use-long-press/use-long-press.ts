import { useCallback, useRef, type MouseEvent, type TouchEvent } from "react";

/** Options for {@link useLongPress}. */
export interface UseLongPressOptions {
  /** How long the press must be held before firing, in ms. Defaults to `400`. */
  delay?: number;
}

/** Handlers returned by {@link useLongPress}, spread onto the target element. */
export interface UseLongPressHandlers {
  onMouseDown: (event: MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (event: TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Detects a long press (mouse or touch). Spread the returned handlers onto an
 * element; `callback` fires once the press is held for `delay` ms, and is
 * cancelled if the pointer is released or leaves first.
 *
 * @param callback - Called with the originating event once the press is held.
 * @param options - `{ delay }`.
 * @returns Event handlers to spread onto the target element.
 */
export const useLongPress = (
  callback: (event: MouseEvent | TouchEvent) => void,
  options: UseLongPressOptions = {},
): UseLongPressHandlers => {
  const { delay = 400 } = options;
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      timeout.current = setTimeout(() => callbackRef.current(event), delay);
    },
    [delay],
  );

  const cancel = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
};
