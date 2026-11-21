import { useState } from "react";

/**
 * Like `useState`, but reads back the `defaultValue` whenever the state is
 * `null` or `undefined`. The setter still accepts `null`/`undefined` — the
 * fallback is applied only on read.
 *
 * @category state
 * @keywords default value, fallback, null fallback, nullish, reset to default
 * @param initialValue - The initial value. If nullish, the defaultValue is returned.
 * @param defaultValue - The value returned when the initial value is nullish.
 * @returns [0] value - The current value.
 * @returns [1] setValue - Sets the value.
 *
 * @example Usage
 * ```tsx
 * import { useDefaultValue } from "hookli";
 *
 * export function Demo() {
 *   const [value, setValue] = useDefaultValue<string>(null, "default");
 *
 *   return (
 *     <div>
 *       <p>{value}</p>
 *       <button onClick={() => setValue("new value")}>Set new value</button>
 *       <button onClick={() => setValue(undefined)}>Set undefined</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDefaultValue = <T>(initialValue: T | null | undefined, defaultValue: T): [T, (value: T | null | undefined) => void] => {
  const [value, setValue] = useState<T | null | undefined>(initialValue);
  return [value === null || value === undefined ? defaultValue : value, setValue];
};

/** @deprecated Use `useDefaultValue` instead. */
export const useDefault = useDefaultValue;
