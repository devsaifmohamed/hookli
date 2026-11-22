import { useEffect, type EffectCallback } from "react";

/**
 * Runs an effect exactly once, on mount. A convenience wrapper around
 * `useEffect(effect, [])` that makes the intent explicit and contains the
 * exhaustive-deps exception in one place.
 *
 * @category effects
 * @keywords run once, on mount, componentDidMount, mount effect
 *
 * @example Usage
 * ```tsx
 * import { useEffectOnce } from "hookli";
 *
 * export function Demo() {
 *   useEffectOnce(() => {
 *     console.log("Component mounted exactly once");
 *
 *     return () => {
 *       console.log("Component unmounted");
 *     };
 *   });
 *
 *   return <div>Mounted</div>;
 * }
 * ```
 */
export const useEffectOnce = (effect: EffectCallback): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
