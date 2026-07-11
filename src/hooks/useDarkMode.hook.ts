import { useEffect, useState } from "react";

interface UseDarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

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
