import { useCallback, useState } from "react";

export interface UseBooleanReturn {
  value: boolean;
  setValue: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

/**
 * A custom hook to manage a boolean value with convenient setters.
 *
 * @category state
 * @keywords boolean, flag, setTrue, setFalse, open state, visibility flag
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
