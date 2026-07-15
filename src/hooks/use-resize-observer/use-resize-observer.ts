import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * The size reported by {@link useResizeObserver}. Both values are `undefined`
 * until the first measurement lands.
 */
export interface ResizeObserverSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Options accepted by {@link useResizeObserver}.
 */
export interface UseResizeObserverOptions {
  /** Which box model to measure. Defaults to `content-box`. */
  box?: ResizeObserverBoxOptions;
  /** Called with the freshly measured size on every resize. */
  onResize?: (size: ResizeObserverSize) => void;
}

/**
 * Measures an element's size reactively via `ResizeObserver`.
 *
 * The observer is created inside an effect and disconnected on cleanup, so the
 * hook is SSR-safe and leaks nothing. Both dimensions start `undefined` and
 * populate after the first observed layout.
 *
 * @param ref - A ref to the element to measure.
 * @param options - Which box to measure and an optional resize callback.
 * @returns The element's `{ width, height }`.
 */
export const useResizeObserver = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options: UseResizeObserverOptions = {},
): ResizeObserverSize => {
  const { box = "content-box" } = options;
  const [size, setSize] = useState<ResizeObserverSize>({
    width: undefined,
    height: undefined,
  });

  const onResizeRef = useRef(options.onResize);
  onResizeRef.current = options.onResize;

  const previous = useRef<ResizeObserverSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const boxSize =
        box === "border-box"
          ? entry.borderBoxSize
          : box === "device-pixel-content-box"
            ? entry.devicePixelContentBoxSize
            : entry.contentBoxSize;

      const measured = Array.isArray(boxSize) ? boxSize[0] : boxSize;

      const width = measured
        ? measured.inlineSize
        : entry.contentRect.width;
      const height = measured
        ? measured.blockSize
        : entry.contentRect.height;

      if (
        previous.current.width === width &&
        previous.current.height === height
      ) {
        return;
      }

      const next = { width, height };
      previous.current = next;
      setSize(next);
      onResizeRef.current?.(next);
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [ref, box]);

  return size;
};
