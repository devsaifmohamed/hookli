import { useEffect, useState } from "react";

/**
 * Tracks whether the page/tab is currently visible via the Page Visibility API
 * (`document.visibilityState`). The listener attaches in an effect, so it is
 * SSR-safe (returns `true` on the server).
 *
 * @category effects
 * @keywords page visibility, tab hidden, tab visible, visibilitychange, background tab, tab focus
 *
 * @example Usage
 * ```tsx
 * import { usePageVisibility } from "hookli";
 *
 * export function Demo() {
 *   const isVisible = usePageVisibility();
 *
 *   return (
 *     <div>
 *       <p>Tab is currently: {isVisible ? "Visible" : "Hidden"}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const usePageVisibility = (): boolean => {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return visible;
};
