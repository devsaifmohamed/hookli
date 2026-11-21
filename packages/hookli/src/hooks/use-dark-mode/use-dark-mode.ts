import { useEffect, useState } from "react";

interface UseDarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Dark-mode boolean with toggle.
 *
 * @category state
 * @keywords dark mode, theme, dark theme toggle, night mode, remember theme
 * @returns isDarkMode - Current mode. Initialized from localStorage("theme") on the client; false
 *   during SSR.
 * @returns toggleDarkMode - Flips the mode. An effect persists it to localStorage("theme") and
 *   toggles a "dark" class on <body>.
 *
 * @example Usage
 * ```tsx
 * import { useDarkMode } from "hookli";
 *
 * export function Demo() {
 *   const { isDarkMode, toggleDarkMode } = useDarkMode();
 *
 *   return (
 *     <div className={isDarkMode ? "panel-dark" : "panel-light"}>
 *       <button onClick={toggleDarkMode}>
 *         {isDarkMode ? "Switch to light" : "Switch to dark"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDarkMode = (): UseDarkModeState => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // SSR-safe: no localStorage on the server.
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const bodyElement = document.body;
    const darkClass = "dark"; // Replace with your actual class name

    bodyElement.classList.toggle(darkClass, isDarkMode);
    // Persist the CURRENT theme (not the pre-toggle value).
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Cleanup: drop the class on unmount.
    return () => {
      bodyElement.classList.remove(darkClass);
    };
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
