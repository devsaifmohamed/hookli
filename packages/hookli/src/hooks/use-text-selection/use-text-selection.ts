import { useEffect, useState } from "react";

/**
 * Tracks the text the user has currently selected on the page
 * (`window.getSelection()`), updating on every `selectionchange`. The listener
 * attaches in an effect, so it is SSR-safe (returns `""` on the server).
 *
 * @returns The selected text, or `""` when nothing is selected.
 */
export const useTextSelection = (): string => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const update = () => setText(window.getSelection()?.toString() ?? "");
    update();
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  return text;
};
