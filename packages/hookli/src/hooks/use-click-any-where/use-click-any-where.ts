import { useEventListener } from "../use-event-listener";

/**
 * Calls a handler on every click anywhere in the document.
 *
 * Subscribes to `click` on `window` and forwards the latest handler on each
 * dispatch, cleaning the listener up on unmount. The subscription lives inside
 * an effect so the hook is SSR-safe.
 *
 * @category dom
 * @keywords click anywhere, global click, document click, any click on page
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useClickAnyWhere } from "hookli";
 *
 * export function Demo() {
 *   const [clicks, setClicks] = useState(0);
 *
 *   useClickAnyWhere(() => setClicks((prev) => prev + 1));
 *
 *   return <p>Document clicks: {clicks}</p>;
 * }
 * ```
 */
export const useClickAnyWhere = (
  handler: (event: MouseEvent) => void,
): void => {
  useEventListener("click", handler);
};
