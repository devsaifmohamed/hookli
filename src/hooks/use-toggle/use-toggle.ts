import { useCallback, useState } from "react";

/**
 * A custom hook to toggle a boolean value.
 *
 * @param initialValue - The initial boolean value. Defaults to `false`.
 * @returns An array containing the current state, a function to toggle it, and a function to explicitly set the value.
 */
export const useToggle = (initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] => {
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
