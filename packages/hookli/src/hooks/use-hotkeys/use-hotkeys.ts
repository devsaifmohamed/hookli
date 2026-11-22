import { useEffect, useRef } from "react";

const MODIFIERS = [
  "ctrl",
  "control",
  "meta",
  "cmd",
  "command",
  "shift",
  "alt",
  "option",
];

/**
 * Binds a keyboard shortcut to a callback. Accepts a `"+"`-separated combo such
 * as `"ctrl+k"`, `"meta+shift+p"`, or a single key like `"Escape"`. The listener
 * attaches to `window` in an effect (SSR-safe) and calls `preventDefault()` on a
 * match. The callback is held in a ref, so re-renders don't re-bind.
 *
 * @category dom
 * @keywords hotkeys, keyboard shortcut, key combo, ctrl, cmd, command palette, shortcut
 *
 * @example Usage
 * ```tsx
 * import { useHotkeys } from "hookli";
 *
 * export function Demo() {
 *   useHotkeys("ctrl+k", () => {
 *     console.log("Ctrl+K pressed");
 *   });
 *
 *   return <div>Press Ctrl+K to trigger shortcut</div>;
 * }
 * ```
 */
export const useHotkeys = (
  keys: string,
  callback: (event: KeyboardEvent) => void,
): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const parts = keys.toLowerCase().split("+").map((part) => part.trim());
    const needCtrl = parts.includes("ctrl") || parts.includes("control");
    const needMeta =
      parts.includes("meta") ||
      parts.includes("cmd") ||
      parts.includes("command");
    const needShift = parts.includes("shift");
    const needAlt = parts.includes("alt") || parts.includes("option");
    const mainKey = parts.find((part) => !MODIFIERS.includes(part));

    const handler = (event: KeyboardEvent) => {
      if (!mainKey) return;
      if (
        event.ctrlKey === needCtrl &&
        event.metaKey === needMeta &&
        event.shiftKey === needShift &&
        event.altKey === needAlt &&
        event.key.toLowerCase() === mainKey
      ) {
        event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keys]);
};
