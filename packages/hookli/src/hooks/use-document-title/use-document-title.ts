import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";
import { useUnmount } from "../use-unmount";

/**
 * Options for {@link useDocumentTitle}.
 */
export interface UseDocumentTitleOptions {
  /**
   * When `false`, the previous document title is restored on unmount. Defaults
   * to `true`, which leaves the title in place.
   */
  preserveTitleOnUnmount?: boolean;
}

/**
 * Keeps `document.title` in sync with the given `title`.
 *
 * The update runs in a layout effect on the client and is a no-op during server
 * rendering, so it is SSR-safe. When `preserveTitleOnUnmount` is `false`, the
 * title captured on mount is restored when the component unmounts.
 *
 * @param title - The document title to apply.
 * @param options - Behaviour options (see {@link UseDocumentTitleOptions}).
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
