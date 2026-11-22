import { useEffect, useRef, useState, type RefObject } from "react";

export interface ResizeObserverSize {
  /** In pixels. */
  width: number | undefined;
  /** In pixels. */
  height: number | undefined;
}

export interface UseResizeObserverOptions {
  /**
   * Which box model to measure: content-box, border-box or device-pixel-content-box. Defaults to
   * `"content-box"`.
   */
  box?: ResizeObserverBoxOptions;
  onResize?: (size: ResizeObserverSize) => void;
}

/**
 * Measures an element's size reactively via `ResizeObserver`.
 *
 * The observer is created inside an effect and disconnected on cleanup, so the
 * hook is SSR-safe and leaks nothing. Both dimensions start `undefined` and
 * populate after the first observed layout.
 *
 * Pass a ref (`useRef`) or the element itself (for example from
 * `const [el, setEl] = useState(null)` and `ref={setEl}`, which also follows an
 * element that a child component mounts).
 *
 * @category dom
 * @keywords resize observer, element size, element width, element height, measure element,
 *   container size
 *
 * @example Usage
 * ```tsx
 * import { useRef } from "react";
 * import { useResizeObserver } from "hookli";
 *
 * export function Demo() {
 *   const boxRef = useRef<HTMLDivElement>(null);
 *   const { width, height } = useResizeObserver(boxRef);
 *
 *   return (
 *     <div ref={boxRef}>
 *       {width === undefined ? "Measuring…" : `${Math.round(width)} × ${Math.round(height ?? 0)}`}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Element mounted by a child component
 * A `useRef` cannot tell the hook when a child component shows its element. Keep the element in
 * state with `ref={setEl}` and pass it instead: the hook follows it wherever it is mounted.
 * ```tsx
 * import { useState } from "react";
 * import { useResizeObserver } from "hookli";
 *
 * function Panel({ onPanel }: { onPanel: (el: HTMLDivElement | null) => void }) {
 *   const [open, setOpen] = useState(false);
 *   return (
 *     <>
 *       <button onClick={() => setOpen((o) => !o)}>Toggle panel</button>
 *       {open && <div ref={onPanel} style={{ resize: "horizontal", overflow: "auto" }}>Resize me</div>}
 *     </>
 *   );
 * }
 *
 * export function Layout() {
 *   const [panel, setPanel] = useState<HTMLDivElement | null>(null);
 *   const { width } = useResizeObserver(panel);
 *   return (
 *     <>
 *       <Panel onPanel={setPanel} />
 *       <p>Panel width: {width ?? "not shown"}</p>
 *     </>
 *   );
 * }
 * ```
 */
export const useResizeObserver = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null> | T | null,
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

  // The element and box being observed right now.
  const observing = useRef<{ element: Element; box: ResizeObserverBoxOptions; observer: ResizeObserver } | null>(null);

  // No dependency array: the ref's element can appear, change or disappear on
  // any commit, so check it every time and re-observe only when it changed.
  useEffect(() => {
    const element = ref === null || isElement(ref) ? ref : ref.current;
    const current = observing.current;
    if (current && current.element === element && current.box === box) return;

    current?.observer.disconnect();
    observing.current = null;
    // A new element is measured from scratch, even if it happens to match the old size.
    previous.current = { width: undefined, height: undefined };
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
    observing.current = { element, box, observer };
  });

  // Disconnect on unmount.
  useEffect(
    () => () => {
      observing.current?.observer.disconnect();
      observing.current = null;
    },
    [],
  );

  return size;
};

const isElement = (value: object): value is Element => typeof (value as Element).nodeType === "number";
