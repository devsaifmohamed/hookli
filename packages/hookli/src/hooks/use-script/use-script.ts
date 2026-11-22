import { useEffect, useState } from "react";

export type UseScriptStatus = "idle" | "loading" | "ready" | "error";

export interface UseScriptOptions {
  /**
   * Keep the status "idle" without injecting the script — useful for deferring a load. Defaults to
   * `false`.
   */
  shouldPreventLoad?: boolean;
  /** Remove the injected <script> tag when the component unmounts. Defaults to `false`. */
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
 * @category dom
 * @keywords load script, script tag, third party script, external script, sdk loader, cdn script
 * @returns status - The current load status: "idle" | "loading" | "ready" | "error".
 *
 * @example Usage
 * ```tsx
 * import { useScript } from "hookli";
 *
 * export function Demo() {
 *   const status = useScript("https://example.com/widget.js");
 *
 *   if (status === "ready") return <p>Widget loaded.</p>;
 *   return <p>Loading… ({status})</p>;
 * }
 * ```
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
