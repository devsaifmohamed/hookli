import { useEffect, useState } from "react";

/**
 * Tracks whether a specific key is currently held down. Listens for `keydown`
 * and `keyup` on `window` (attached in an effect, so SSR-safe) and removes the
 * listeners on unmount.
 *
 * @category dom
 * @keywords key press, key down, key held, keyboard key, escape key, is key pressed
 * @param targetKey - The KeyboardEvent.key to watch (e.g. 'Enter', 'Escape').
 * @returns pressed - True while the specified key is held down.
 *
 * @example Usage
 * ```tsx
 * import { useKeyPress } from "hookli";
 *
 * export function Demo() {
 *   const enterPressed = useKeyPress("Enter");
 *   const escapePressed = useKeyPress("Escape");
 *
 *   return (
 *     <div>
 *       <p>Enter: {enterPressed ? "Pressed" : "Released"}</p>
 *       <p>Escape: {escapePressed ? "Pressed" : "Released"}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useKeyPress = (targetKey: string): boolean => {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === targetKey) setPressed(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === targetKey) setPressed(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [targetKey]);

  return pressed;
};
