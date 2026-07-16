import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options accepted by {@link useIntersectionObserver}.
 */
export interface UseIntersectionObserverOptions {
  /** One or more thresholds at which to fire the callback. */
  threshold?: number | number[];
  /** The element used as the viewport. Defaults to the browser viewport. */
  root?: Element | Document | null;
  /** Margin around the root, in CSS-margin syntax. */
  rootMargin?: string;
  /** Once the target is visible, stop updating and keep the visible state. */
  freezeOnceVisible?: boolean;
  /** Initial `isIntersecting` value used before the observer first reports. */
  initialIsIntersecting?: boolean;
  /** Called with the latest entry whenever intersection changes. */
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

/**
 * The value returned by {@link useIntersectionObserver}.
 */
export interface UseIntersectionObserverReturn {
  /** Ref callback to attach to the element you want to observe. */
  ref: (node: Element | null) => void;
  /** Whether the observed element is currently intersecting the root. */
  isIntersecting: boolean;
  /** The most recent observer entry, or `null` before the first report. */
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
 * @param options - Observer thresholds, root, and behaviour flags.
 * @returns A `ref` callback plus the current `isIntersecting` flag and `entry`.
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
