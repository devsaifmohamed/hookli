import { useState } from "react";

/**
 * Like `useState`, but reads back the `defaultValue` whenever the state is
 * `null` or `undefined`. The setter still accepts `null`/`undefined` — the
 * fallback is applied only on read.
 *
 * @param initialValue - The initial value.
 * @param defaultValue - The value returned whenever the state is nullish.
 * @returns A `[value, setValue]` tuple.
 */
export const useDefault = <T>(
  initialValue: T | null | undefined,
  defaultValue: T,
): [T, (value: T | null | undefined) => void] => {
  const [value, setValue] = useState<T | null | undefined>(initialValue);
  return [value === null || value === undefined ? defaultValue : value, setValue];
};
