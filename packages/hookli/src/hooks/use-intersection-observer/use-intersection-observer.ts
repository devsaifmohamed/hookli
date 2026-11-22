import { useCallback, useEffect, useRef, useState } from "react";

export interface UseIntersectionObserverOptions {
  /** One or more visibility ratios at which to fire. Defaults to `0`. */
  threshold?: number | number[];
  /** `null` is the browser viewport. Defaults to `null`. */
  root?: Element | Document | null;
  /**
   * Margin around the root, in CSS-margin syntax — grows or shrinks the trigger area. Defaults to
   * `"0%"`.
   */
  rootMargin?: string;
  /** Once the target is visible, stop observing and keep the visible state. Defaults to `false`. */
  freezeOnceVisible?: boolean;
  /** isIntersecting value used before the observer first reports. Defaults to `false`. */
  initialIsIntersecting?: boolean;
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

export interface UseIntersectionObserverReturn {
  ref: (node: Element | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Observes an element's intersection with the viewport (or a custom root) via
 * `IntersectionObserver`, exposing a ref callback to attach to the target.
 *
 * The observer is created inside an effect and disconnected on cleanup, so the
 * hook is SSR-safe and leaks nothing. When `freezeOnceVisible` is set the hook
 * stops observing after the first intersection and retains the visible state.
 *
 * @category dom
 * @keywords intersection observer, in view, visible in viewport, lazy load, scroll into view, on
 *   screen
 * @param options
 *
 * @example Usage
 * ```tsx
 * import { useIntersectionObserver } from "hookli";
 *
 * export function Demo() {
 *   const { ref, isIntersecting } = useIntersectionObserver({
 *     threshold: 0.5,
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {isIntersecting ? "In view" : "Scroll me into view"}
 *     </div>
 *   );
 * }
 * ```
 */
export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
  initialIsIntersecting = false,
  onChange,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn => {
  const [element, setElement] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(
    initialIsIntersecting,
  );
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (frozen) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);
        onChangeRef.current?.(observerEntry.isIntersecting, observerEntry);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, JSON.stringify(threshold), root, rootMargin, frozen]);

  return { ref, isIntersecting, entry };
};
