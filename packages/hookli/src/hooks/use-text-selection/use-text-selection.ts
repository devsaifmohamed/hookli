import { useEffect, useState } from "react";

/**
 * Tracks the text the user has currently selected on the page
 * (`window.getSelection()`), updating on every `selectionchange`. The listener
 * attaches in an effect, so it is SSR-safe (returns `""` on the server).
 *
 * @category dom
 * @keywords text selection, selected text, highlight, window.getSelection, quote selection
 * @returns text - The currently selected text on the document.
 *
 * @example Usage
 * ```tsx
 * import { useTextSelection } from "hookli";
 *
 * export function Demo() {
 *   const selection = useTextSelection();
 *
 *   return (
 *     <div>
 *       <p>Select text on this page.</p>
 *       <p>Selected: {selection || "(none)"}</p>
 *     </div>
 *   );
 * }
 * ```
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
