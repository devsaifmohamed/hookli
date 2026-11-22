import { useCallback } from "react";
import { useLocalStorage } from "../use-local-storage";
import { useMediaQuery } from "../use-media-query";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_STORAGE_KEY = "hookli-ternary-dark-mode";

/** "system" follows the OS; "dark" and "light" force a mode. */
export type TernaryDarkMode = "system" | "dark" | "light";

export interface UseTernaryDarkModeOptions {
  /** Defaults to `"system"`. */
  defaultValue?: TernaryDarkMode;
  /** Defaults to `"hookli-ternary-dark-mode"`. */
  localStorageKey?: string;
}

export interface UseTernaryDarkModeReturn {
  /** True when the mode is "dark", or "system" while the OS prefers dark. */
  isDarkMode: boolean;
  ternaryDarkMode: TernaryDarkMode;
  setTernaryDarkMode: (
    value: TernaryDarkMode | ((prev: TernaryDarkMode) => TernaryDarkMode),
  ) => void;
  /** Cycle the preference: light → system → dark → light. */
  toggleTernaryDarkMode: () => void;
}

/**
 * Three-state dark-mode preference — `"system"`, `"dark"`, or `"light"` —
 * persisted to `localStorage` and resolved against the OS color scheme.
 *
 * SSR-safe: the OS preference is read via {@link useMediaQuery} and the stored
 * choice via {@link useLocalStorage}, both of which defer browser access to
 * effects.
 *
 * @category state
 * @keywords dark light system, theme switcher, system theme, three way theme, color scheme toggle,
 *   prefers-color-scheme, follow os theme
 *
 * @example Usage
 * ```tsx
 * import { useTernaryDarkMode, type TernaryDarkMode } from "hookli";
 *
 * export function Demo() {
 *   const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } =
 *     useTernaryDarkMode();
 *
 *   return (
 *     <div className={isDarkMode ? "panel-dark" : "panel-light"}>
 *       <select
 *         value={ternaryDarkMode}
 *         onChange={(e) => setTernaryDarkMode(e.target.value as TernaryDarkMode)}
 *       >
 *         <option value="light">Light</option>
 *         <option value="system">System</option>
 *         <option value="dark">Dark</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
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
