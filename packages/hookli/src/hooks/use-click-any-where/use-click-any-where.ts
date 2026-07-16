import { useEventListener } from "../use-event-listener";

/**
 * Calls a handler on every click anywhere in the document.
 *
 * Subscribes to `click` on `window` and forwards the latest handler on each
 * dispatch, cleaning the listener up on unmount. The subscription lives inside
 * an effect so the hook is SSR-safe.
 *
 * @param handler - Called with the `MouseEvent` on every document-wide click.
 */
export const useClickAnyWhere = (
  handler: (event: MouseEvent) => void,
): void => {
  useEventListener("click", handler);
};
