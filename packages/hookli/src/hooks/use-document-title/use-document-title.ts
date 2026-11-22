import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";
import { useUnmount } from "../use-unmount";

export interface UseDocumentTitleOptions {
  /** When false, the title from mount is restored on unmount. Defaults to `true`. */
  preserveTitleOnUnmount?: boolean;
}

/**
 * Keeps `document.title` in sync with the given `title`.
 *
 * The update runs in a layout effect on the client and is a no-op during server
 * rendering, so it is SSR-safe. When `preserveTitleOnUnmount` is `false`, the
 * title captured on mount is restored when the component unmounts.
 *
 * @category effects
 * @keywords document title, page title, tab title, browser title
 *
 * @example Usage
 * ```tsx
 * import { useDocumentTitle } from "hookli";
 *
 * export function Demo() {
 *   useDocumentTitle("Dashboard — hookli", {
 *     preserveTitleOnUnmount: false,
 *   });
 *
 *   return <h1>Dashboard</h1>;
 * }
 * ```
 */
export const useDocumentTitle = (
  title: string,
  options: UseDocumentTitleOptions = {},
): void => {
  const { preserveTitleOnUnmount = true } = options;
  const defaultTitle = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    defaultTitle.current = window.document.title;
  }, []);

  useIsomorphicLayoutEffect(() => {
    window.document.title = title;
  }, [title]);

  useUnmount(() => {
    if (!preserveTitleOnUnmount && defaultTitle.current !== null) {
      window.document.title = defaultTitle.current;
    }
  });
};
