import { useCallback, useEffect, useState, type RefObject } from "react";

/** The value returned by {@link useFullscreen}. */
export interface UseFullscreenReturn {
  /** Whether the referenced element is currently fullscreen. */
  isFullscreen: boolean;
  /** Request fullscreen for the referenced element. */
  enter: () => Promise<void>;
  /** Exit fullscreen (if this element is fullscreen). */
  exit: () => Promise<void>;
  /** Toggle fullscreen for the referenced element. */
  toggle: () => Promise<void>;
}

/**
 * Controls the Fullscreen API for a referenced element and tracks whether it is
 * currently fullscreen (via `fullscreenchange`). Listeners attach in an effect,
 * so the hook is SSR-safe; calls are no-ops where the API is unavailable.
 *
 * @param ref - A ref to the element to make fullscreen.
 * @returns `{ isFullscreen, enter, exit, toggle }`.
 */
export const useFullscreen = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [ref]);

  const enter = useCallback(async () => {
    await ref.current?.requestFullscreen?.();
  }, [ref]);

  const exit = useCallback(async () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      await document.exitFullscreen?.();
    }
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement === ref.current) await exit();
    else await enter();
  }, [enter, exit, ref]);

  return { isFullscreen, enter, exit, toggle };
};
