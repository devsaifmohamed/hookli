import { useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

export interface UseScrollLockOptions {
  /** Lock automatically on mount and restore on unmount. Defaults to `true`. */
  autoLock?: boolean;
  /** Element or CSS selector. Defaults to `<body>`. */
  lockTarget?: HTMLElement | string;
  /**
   * Compensate for the removed scrollbar with padding so the layout does not shift. Defaults to
   * `true`.
   */
  widthReflow?: boolean;
}

export interface UseScrollLockReturn {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
}

interface OriginalStyle {
  overflow: string;
  paddingRight: string;
}

/**
 * Locks and restores scrolling on an element (the document body by default).
 *
 * Setting `overflow: hidden` removes the scrollbar; `widthReflow` compensates by
 * adding padding equal to the scrollbar width so the layout does not shift. All
 * DOM access is deferred to effects/callbacks, so the hook is SSR-safe, and the
 * original styles are restored on unmount if still locked.
 *
 * @category dom
 * @keywords scroll lock, disable scroll, prevent scrolling, body overflow hidden, modal scroll,
 *   lock page
 *
 * @example Usage
 * ```tsx
 * import { useScrollLock } from "hookli";
 *
 * export function Modal({ onClose }: { onClose: () => void }) {
 *   // Locks <body> scroll on mount, restores it on unmount.
 *   useScrollLock();
 *
 *   return (
 *     <div role="dialog" onClick={onClose}>
 *       Scrolling behind this modal is frozen.
 *     </div>
 *   );
 * }
 * ```
 */
export const useScrollLock = (
  options: UseScrollLockOptions = {},
): UseScrollLockReturn => {
  const { autoLock = true, lockTarget, widthReflow = true } = options;

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const target = useRef<HTMLElement | null>(null);
  const originalStyle = useRef<OriginalStyle | null>(null);

  const resolveTarget = useCallback((): HTMLElement | null => {
    if (typeof document === "undefined") return null;
    if (lockTarget instanceof HTMLElement) return lockTarget;
    if (typeof lockTarget === "string") {
      return document.querySelector<HTMLElement>(lockTarget);
    }
    return document.body;
  }, [lockTarget]);

  const lock = useCallback(() => {
    const node = resolveTarget();
    if (!node) return;

    target.current = node;
    originalStyle.current = {
      overflow: node.style.overflow,
      paddingRight: node.style.paddingRight,
    };

    if (widthReflow && typeof window !== "undefined") {
      const scrollbarWidth = window.innerWidth - node.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPadding =
          parseInt(window.getComputedStyle(node).paddingRight, 10) || 0;
        node.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
    }

    node.style.overflow = "hidden";
    setIsLocked(true);
  }, [resolveTarget, widthReflow]);

  const unlock = useCallback(() => {
    const node = target.current;
    if (!node || !originalStyle.current) return;

    node.style.overflow = originalStyle.current.overflow;
    node.style.paddingRight = originalStyle.current.paddingRight;
    originalStyle.current = null;
    setIsLocked(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!autoLock) return;
    lock();
    return () => {
      unlock();
    };
  }, [autoLock, lock, unlock]);

  return { isLocked, lock, unlock };
};
