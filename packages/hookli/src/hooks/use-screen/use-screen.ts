import { useState } from "react";
import { useEventListener } from "../use-event-listener";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

const IS_SERVER = typeof window === "undefined";

export interface UseScreenOptions {
  /**
   * Read the real screen synchronously on mount. Set false to start as null and populate after
   * hydration. Defaults to `true`.
   */
  initializeWithValue?: boolean;
}

/**
 * Tracks the `window.screen` object, refreshing it on every window resize.
 *
 * SSR-safe: on the server (or when `initializeWithValue` is false) the hook
 * starts as `null` and populates after mount. The `resize` listener is attached
 * via {@link useEventListener} and removed on cleanup.
 *
 * @category dom
 * @keywords screen, window.screen, screen resolution, display size, orientation
 *
 * @example Usage
 * ```tsx
 * import { useScreen } from "hookli";
 *
 * export function Demo() {
 *   const screen = useScreen();
 *
 *   return <p>Screen: {screen ? `${screen.width}×${screen.height}` : "…"}</p>;
 * }
 * ```
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
