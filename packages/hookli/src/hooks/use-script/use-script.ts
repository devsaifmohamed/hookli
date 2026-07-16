import { useEffect, useState } from "react";

export type UseScriptStatus = "idle" | "loading" | "ready" | "error";

export interface UseScriptOptions {
  shouldPreventLoad?: boolean;
  removeOnUnmount?: boolean;
}

/**
 * Dynamically loads an external script and reports its load status.
 *
 * SSR-safe: the DOM is touched only inside `useEffect`, which never runs on the
 * server. Existing `<script>` tags for the same `src` are reused (deduped via a
 * `data-status` attribute) so multiple components can share one load. Pass a
 * `null` `src` or `shouldPreventLoad` to keep the status `"idle"`.
 *
 * @param src - The script URL to load, or `null` to skip loading.
 * @param options - Optional `shouldPreventLoad` and `removeOnUnmount` flags.
 * @returns The current status: `"idle" | "loading" | "ready" | "error"`.
 */
export function useScript(
  src: string | null,
  options?: UseScriptOptions,
): UseScriptStatus {
  const [status, setStatus] = useState<UseScriptStatus>(() => {
    if (!src || options?.shouldPreventLoad) {
      return "idle";
    }
    return "loading";
  });

  useEffect(() => {
    if (!src || options?.shouldPreventLoad) {
      setStatus("idle");
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (script === null) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttributeFromEvent = (event: Event) => {
        script?.setAttribute(
          "data-status",
          event.type === "load" ? "ready" : "error",
        );
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      setStatus(
        (script.getAttribute("data-status") as UseScriptStatus | null) ??
          "loading",
      );
    }

    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);

        if (options?.removeOnUnmount) {
          script.remove();
        }
      }
    };
  }, [src, options?.shouldPreventLoad, options?.removeOnUnmount]);

  return status;
}
