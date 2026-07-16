import { useCallback, useState } from "react";

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

export interface UseMapActions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: MapOrEntries<K, V>) => void;
  remove: (key: K) => void;
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
 * @param initialState - Initial entries as a `Map` or an array of `[key, value]`
 * pairs.
 * @returns `[map, { set, setAll, remove, reset }]`.
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
