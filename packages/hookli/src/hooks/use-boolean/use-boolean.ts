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
 * @category state
 * @keywords boolean, flag, setTrue, setFalse, open state, visibility flag
 * @param defaultValue - The value the boolean starts from.
 * @returns value - The current boolean value.
 * @returns setValue - Sets the value directly.
 * @returns setTrue - Sets the value to true.
 * @returns setFalse - Sets the value to false.
 * @returns toggle - Flips the value.
 *
 * @example Usage
 * ```tsx
 * import { useBoolean } from "hookli";
 *
 * export function Demo() {
 *   const { value, setTrue, setFalse, toggle } = useBoolean(false);
 *
 *   return (
 *     <div>
 *       <p>{value ? "On" : "Off"}</p>
 *       <button onClick={toggle}>Toggle</button>
 *       <button onClick={setTrue}>On</button>
 *       <button onClick={setFalse}>Off</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useBoolean = (defaultValue: boolean = false): UseBooleanReturn => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setValue, setTrue, setFalse, toggle };
};
