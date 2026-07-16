import { useCallback, useState } from "react";

export type CopiedValue = string | null;

export type CopyFn = (text: string) => Promise<boolean>;

export type UseCopyToClipboardReturn = [CopiedValue, CopyFn];

/**
 * Copies text to the clipboard via the async Clipboard API and tracks the last
 * successfully-copied value.
 *
 * SSR-safe: `navigator.clipboard` is read only inside the returned `copy`
 * callback, never during render. `copy` resolves to `true` on success and
 * `false` when the API is unavailable or the write is rejected, resetting the
 * tracked value to `null` on failure.
 *
 * @returns `[copiedText, copy]` — the last copied string (or `null`) and the
 * async copy function.
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
