import { useEffect, useState } from "react";

/**
 * Tracks whether the page/tab is currently visible via the Page Visibility API
 * (`document.visibilityState`). The listener attaches in an effect, so it is
 * SSR-safe (returns `true` on the server).
 *
 * @returns `true` while the tab is visible, `false` when hidden/backgrounded.
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
