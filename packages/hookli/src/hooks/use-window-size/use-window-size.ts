import { useState } from "react";
import { useEventListener } from "../use-event-listener";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

const IS_SERVER = typeof window === "undefined";

/**
 * The viewport size reported by {@link useWindowSize}.
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Options accepted by {@link useWindowSize}.
 */
export interface UseWindowSizeOptions {
  /** Read the real size synchronously on mount. Defaults to `true`. */
  initializeWithValue?: boolean;
}

/**
 * Tracks the viewport's `{ width, height }`, updating on every window resize.
 *
 * SSR-safe: on the server (or when `initializeWithValue` is false) both values
 * start at `0` and populate after mount. The `resize` listener is attached via
 * {@link useEventListener} and removed on cleanup.
 *
 * @param options - Optional hydration flag.
 * @returns The current window `{ width, height }` in pixels.
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { initializeWithValue = true } = options;

  const readSize = (): WindowSize => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (initializeWithValue && !IS_SERVER) return readSize();
    return { width: 0, height: 0 };
  });

  const handleSize = () => {
    if (IS_SERVER) return;
    setWindowSize(readSize());
  };

  useEventListener("resize", handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return windowSize;
}
