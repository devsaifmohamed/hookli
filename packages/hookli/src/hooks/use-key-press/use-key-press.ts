import { useEffect, useState } from "react";

/**
 * Tracks whether a specific key is currently held down. Listens for `keydown`
 * and `keyup` on `window` (attached in an effect, so SSR-safe) and removes the
 * listeners on unmount.
 *
 * @param targetKey - The `KeyboardEvent.key` to watch (e.g. `"Enter"`, `"a"`, `"Escape"`).
 * @returns `true` while the key is pressed, `false` otherwise.
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
