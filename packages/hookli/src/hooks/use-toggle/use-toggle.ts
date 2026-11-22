import { useCallback, useState } from "react";

/**
 * A custom hook to toggle a boolean value.
 *
 * @category state
 * @keywords toggle, on off, flip boolean, show hide, open close, switch
 *
 * @example Usage
 * ```tsx
 * import { useToggle } from "hookli";
 *
 * export function Demo() {
 *   const [on, toggle, setOn] = useToggle(false);
 *
 *   return (
 *     <div>
 *       <button onClick={toggle}>{on ? "On" : "Off"}</button>
 *       <button onClick={() => setOn(true)}>Set on</button>
 *       <button onClick={() => setOn(false)}>Set off</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useToggle = (initialValue: boolean = false): [value: boolean, toggle: () => void, setValue: (value: boolean) => void] => {
  const [state, setState] = useState<boolean>(initialValue);

  // Toggles the current state
  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  // Allows setting a specific value
  const setExplicit = useCallback((value: boolean) => {
    setState(value);
  }, []);

  return [state, toggle, setExplicit];
};
