import { useEffect, useRef, type DependencyList, type EffectCallback } from "react";

/** Minimal structural deep-equality for dependency lists (no external deps). */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
  );
};

/**
 * A `useEffect` that compares its dependencies by **deep** structural equality
 * instead of reference. Use it when deps are objects/arrays recreated on every
 * render (so a normal `useEffect` would fire every time).
 *
 * @category effects
 * @keywords deep compare, deep equal, object dependencies, array dependencies, effect runs too
 *   often
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useDeepCompareEffect } from "hookli";
 *
 * export function Demo() {
 *   const [user, setUser] = useState({ name: "Alice", age: 25 });
 *
 *   useDeepCompareEffect(() => {
 *     console.log("Deep effect triggered:", user);
 *   }, [user]);
 *
 *   return (
 *     <div>
 *       <p>{user.name} ({user.age})</p>
 *       <button onClick={() => setUser({ ...user })}>Recreate object reference</button>
 *       <button onClick={() => setUser({ ...user, age: user.age + 1 })}>Increment age</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDeepCompareEffect = (
  effect: EffectCallback,
  deps: DependencyList,
): void => {
  const ref = useRef<DependencyList | undefined>(undefined);
  const signal = useRef<number>(0);

  if (ref.current === undefined || !deepEqual(deps, ref.current)) {
    ref.current = deps;
    signal.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [signal.current]);
};
