import { useState, type RefObject } from "react";
import { useEventListener } from "../use-event-listener";

/**
 * Tracks whether the pointer is currently hovering the referenced element.
 *
 * Listens for `mouseenter` / `mouseleave` on the element the ref points to and
 * cleans the listeners up automatically. The subscription lives inside an effect
 * so the hook is SSR-safe.
 *
 * @param elementRef - A ref to the element whose hover state to track.
 * @returns `true` while the pointer is over the element, otherwise `false`.
 */
export const useHover = <T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
): boolean => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEventListener("mouseenter", () => setIsHovered(true), elementRef);
  useEventListener("mouseleave", () => setIsHovered(false), elementRef);

  return isHovered;
};
