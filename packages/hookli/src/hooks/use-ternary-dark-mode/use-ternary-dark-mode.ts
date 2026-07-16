import { useCallback } from "react";
import { useLocalStorage } from "../use-local-storage";
import { useMediaQuery } from "../use-media-query";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_STORAGE_KEY = "hookli-ternary-dark-mode";

export type TernaryDarkMode = "system" | "dark" | "light";

export interface UseTernaryDarkModeOptions {
  defaultValue?: TernaryDarkMode;
  localStorageKey?: string;
}

export interface UseTernaryDarkModeReturn {
  isDarkMode: boolean;
  ternaryDarkMode: TernaryDarkMode;
  setTernaryDarkMode: (
    value: TernaryDarkMode | ((prev: TernaryDarkMode) => TernaryDarkMode),
  ) => void;
  toggleTernaryDarkMode: () => void;
}

/**
 * Three-state dark-mode preference — `"system"`, `"dark"`, or `"light"` —
 * persisted to `localStorage` and resolved against the OS color scheme.
 *
 * SSR-safe: the OS preference is read via {@link useMediaQuery} and the stored
 * choice via {@link useLocalStorage}, both of which defer browser access to
 * effects. `isDarkMode` is `true` when the mode is `"dark"`, or `"system"` while
 * the OS prefers dark. `toggleTernaryDarkMode` cycles light → system → dark.
 *
 * @param options - Optional `defaultValue` (default `"system"`) and
 * `localStorageKey`.
 * @returns `{ isDarkMode, ternaryDarkMode, setTernaryDarkMode, toggleTernaryDarkMode }`.
 */
export function useTernaryDarkMode(
  options: UseTernaryDarkModeOptions = {},
): UseTernaryDarkModeReturn {
  const { defaultValue = "system", localStorageKey = DEFAULT_STORAGE_KEY } =
    options;

  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY);
  const { value: ternaryDarkMode, setStoredValue: setTernaryDarkMode } =
    useLocalStorage<TernaryDarkMode>(localStorageKey, defaultValue);

  const isDarkMode =
    ternaryDarkMode === "dark" || (ternaryDarkMode === "system" && isDarkOS);

  const toggleTernaryDarkMode = useCallback(() => {
    const cycle: TernaryDarkMode[] = ["light", "system", "dark"];
    setTernaryDarkMode((prev) => {
      const nextIndex = (cycle.indexOf(prev) + 1) % cycle.length;
      return cycle[nextIndex];
    });
  }, [setTernaryDarkMode]);

  return {
    isDarkMode,
    ternaryDarkMode,
    setTernaryDarkMode,
    toggleTernaryDarkMode,
  };
}
