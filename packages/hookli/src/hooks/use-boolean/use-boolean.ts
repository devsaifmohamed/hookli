import { useCallback, useState } from "react";

/**
 * The value and setters returned by {@link useBoolean}.
 */
export interface UseBooleanReturn {
  /** The current boolean value. */
  value: boolean;
  /** Set the value directly. */
  setValue: (value: boolean) => void;
  /** Set the value to `true`. */
  setTrue: () => void;
  /** Set the value to `false`. */
  setFalse: () => void;
  /** Toggle the value. */
  toggle: () => void;
}

/**
 * A custom hook to manage a boolean value with convenient setters.
 *
 * @param defaultValue - The initial boolean value. Defaults to `false`.
 * @returns An object with the current value and setters `setValue`, `setTrue`, `setFalse`, and `toggle`.
 */
export const useBoolean = (defaultValue: boolean = false): UseBooleanReturn => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setValue, setTrue, setFalse, toggle };
};
