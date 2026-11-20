import { useState, type RefObject } from "react";
import { useEventListener } from "../use-event-listener";

/**
 * Tracks whether the pointer is currently hovering the referenced element.
 *
 * Listens for `mouseenter` / `mouseleave` on the element and cleans the
 * listeners up automatically. Pass a ref (`useRef`) or the element itself (for
 * example from `const [el, setEl] = useState(null)` and `ref={setEl}`, which also
 * follows an element that a child component mounts). The subscription lives
 * inside an effect so the hook is SSR-safe.
 *
 * @param elementRef - A ref to the element, or the element itself (`null` until mounted).
 * @returns `true` while the pointer is over the element, otherwise `false`.
 */
export const useHover = <T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T | null> | T | null,
): boolean => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEventListener("mouseenter", () => setIsHovered(true), elementRef);
  useEventListener("mouseleave", () => setIsHovered(false), elementRef);

  return isHovered;
};
