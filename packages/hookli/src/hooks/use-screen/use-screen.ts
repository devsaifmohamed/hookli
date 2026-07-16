import { useState } from "react";
import { useEventListener } from "../use-event-listener";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

const IS_SERVER = typeof window === "undefined";

/**
 * Options accepted by {@link useScreen}.
 */
export interface UseScreenOptions {
  /** Read the real screen synchronously on mount. Defaults to `true`. */
  initializeWithValue?: boolean;
}

/**
 * Tracks the `window.screen` object, refreshing it on every window resize.
 *
 * SSR-safe: on the server (or when `initializeWithValue` is false) the hook
 * starts as `null` and populates after mount. The `resize` listener is attached
 * via {@link useEventListener} and removed on cleanup.
 *
 * @param options - Optional hydration flag.
 * @returns The current `Screen`, or `null` before hydration / on the server.
 */
export function useScreen(options: UseScreenOptions = {}): Screen | null {
  const { initializeWithValue = true } = options;

  const readScreen = (): Screen | null => {
    if (IS_SERVER) return null;
    return window.screen;
  };

  const [screen, setScreen] = useState<Screen | null>(() => {
    if (initializeWithValue) return readScreen();
    return null;
  });

  const handleSize = () => {
    setScreen(readScreen());
  };

  useEventListener("resize", handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return screen;
}
