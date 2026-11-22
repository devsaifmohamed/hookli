import { useCallback, useState } from "react";

export type CopiedValue = string | null;

export type CopyFn = (text: string) => Promise<boolean>;

export type UseCopyToClipboardReturn = [copiedText: CopiedValue, copy: CopyFn];

/**
 * Copies text to the clipboard via the async Clipboard API and tracks the last
 * successfully-copied value.
 *
 * SSR-safe: `navigator.clipboard` is read only inside the returned `copy`
 * callback, never during render. `copy` resolves to `true` on success and
 * `false` when the API is unavailable or the write is rejected, resetting the
 * tracked value to `null` on failure.
 *
 * @category dom
 * @keywords clipboard, copy, copy to clipboard, copy button, copy link, navigator.clipboard
 *
 * @example Usage
 * ```tsx
 * import { useCopyToClipboard } from "hookli";
 *
 * export function Demo() {
 *   const [copiedText, copy] = useCopyToClipboard();
 *
 *   return (
 *     <button type="button" onClick={() => copy("npm i hookli")}>
 *       {copiedText ? "Copied!" : "Copy"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy = useCallback<CopyFn>(async (text) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch {
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
