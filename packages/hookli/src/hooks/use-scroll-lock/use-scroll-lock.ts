import { useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

/**
 * Options accepted by {@link useScrollLock}.
 */
export interface UseScrollLockOptions {
  /** Lock scrolling automatically on mount. Defaults to `true`. */
  autoLock?: boolean;
  /** Element (or CSS selector) whose scroll to lock. Defaults to `<body>`. */
  lockTarget?: HTMLElement | string;
  /** Compensate for the removed scrollbar with padding. Defaults to `true`. */
  widthReflow?: boolean;
}

/**
 * The value returned by {@link useScrollLock}.
 */
export interface UseScrollLockReturn {
  /** Whether the target's scroll is currently locked. */
  isLocked: boolean;
  /** Lock the target's scroll. */
  lock: () => void;
  /** Restore the target's original scroll behaviour. */
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
 * @param options - Auto-lock, the lock target, and scrollbar compensation.
 * @returns The current `isLocked` flag plus `lock` and `unlock`.
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
