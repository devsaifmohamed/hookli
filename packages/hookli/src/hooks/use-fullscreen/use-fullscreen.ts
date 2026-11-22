import { useCallback, useEffect, useState, type RefObject } from "react";

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

/**
 * Controls the Fullscreen API for a referenced element and tracks whether it is
 * currently fullscreen (via `fullscreenchange`). Listeners attach in an effect,
 * so the hook is SSR-safe; calls are no-ops where the API is unavailable.
 *
 * @category dom
 * @keywords fullscreen, full screen, requestFullscreen, presentation mode, video fullscreen
 *
 * @example Usage
 * ```tsx
 * import { useRef } from "react";
 * import { useFullscreen } from "hookli";
 *
 * export function Demo() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { isFullscreen, toggle } = useFullscreen(ref);
 *
 *   return (
 *     <div ref={ref}>
 *       <button onClick={toggle}>
 *         {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
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
