import { useCallback, useState } from "react";

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

/** The second tuple element — the map mutation helpers. */
export interface UseMapActions<K, V> {
  /** Adds or updates one entry. */
  set: (key: K, value: V) => void;
  /** Replaces every entry with the given Map or [key, value] pairs. */
  setAll: (entries: MapOrEntries<K, V>) => void;
  /** Deletes the entry for the given key. */
  remove: (key: K) => void;
  /** Empties the map. */
  reset: () => void;
}

export type ReadOnlyMap<K, V> = Omit<
  Map<K, V>,
  "set" | "clear" | "delete"
>;

export type UseMapReturn<K, V> = [ReadOnlyMap<K, V>, UseMapActions<K, V>];

/**
 * Manages a `Map` as immutable React state, returning a read-only view plus
 * stable mutation helpers.
 *
 * The returned map omits the mutating `Map` methods (`set`/`clear`/`delete`);
 * use the action helpers instead, each of which replaces the map with a fresh
 * copy so React re-renders. No browser globals are touched, so it is SSR-safe.
 *
 * @category state
 * @keywords Map, key value state, dictionary, lookup table
 * @param initialState - Initial entries as a Map or an array of [key, value] pairs.
 * @returns [0] map - A read-only view of the map — the mutating set/clear/delete methods are
 *   omitted; use the actions instead. get, has, size and iteration remain.
 * @returns [1] actions - Stable helpers that replace the map with a fresh copy so React re-renders
 *   — see below.
 *
 * @example Usage
 * ```tsx
 * import { useMap } from "hookli";
 *
 * export function Demo() {
 *   const [map, { set, remove, reset }] = useMap<string, string>([
 *     ["theme", "dark"],
 *   ]);
 *
 *   return (
 *     <div>
 *       <button onClick={() => set("lang", "en")}>Set lang</button>
 *       <button onClick={() => remove("theme")}>Remove theme</button>
 *       <button onClick={reset}>Reset</button>
 *       <ul>
 *         {[...map.entries()].map(([key, value]) => (
 *           <li key={key}>{key}: {value}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMap<K, V>(
  initialState: MapOrEntries<K, V> = new Map(),
): UseMapReturn<K, V> {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initialState));

  const set = useCallback<UseMapActions<K, V>["set"]>((key, value) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const setAll = useCallback<UseMapActions<K, V>["setAll"]>((entries) => {
    setMap(new Map(entries));
  }, []);

  const remove = useCallback<UseMapActions<K, V>["remove"]>((key) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const reset = useCallback<UseMapActions<K, V>["reset"]>(() => {
    setMap(new Map());
  }, []);

  return [map, { set, setAll, remove, reset }];
}
