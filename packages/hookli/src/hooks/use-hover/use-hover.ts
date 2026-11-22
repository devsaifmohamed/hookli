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
 * @category dom
 * @keywords hover, mouse enter, mouse leave, is hovered, hover state
 * @returns isHovered - False on the server and until the first mouseenter.
 *
 * @example Usage
 * ```tsx
 * import { useRef } from "react";
 * import { useHover } from "hookli";
 *
 * export function Demo() {
 *   const boxRef = useRef<HTMLDivElement>(null);
 *   const isHovered = useHover(boxRef);
 *
 *   return (
 *     <div ref={boxRef}>
 *       {isHovered ? "Pointer is over me" : "Hover this panel"}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Element mounted by a child component
 * A `useRef` cannot tell the hook when a child component shows its element. Keep the element in
 * state with `ref={setEl}` and pass it instead: the hook follows it wherever it is mounted.
 * ```tsx
 * import { useState } from "react";
 * import { useHover } from "hookli";
 *
 * function Card({ onCard }: { onCard: (el: HTMLDivElement | null) => void }) {
 *   const [shown, setShown] = useState(false);
 *   return (
 *     <>
 *       <button onClick={() => setShown(true)}>Show card</button>
 *       {shown && <div ref={onCard}>Hover me</div>}
 *     </>
 *   );
 * }
 *
 * export function Page() {
 *   const [card, setCard] = useState<HTMLDivElement | null>(null);
 *   const isHovered = useHover(card);
 *   return (
 *     <>
 *       <Card onCard={setCard} />
 *       <p>{isHovered ? "Hovering the card" : "Not hovering"}</p>
 *     </>
 *   );
 * }
 * ```
 */
export const useHover = <T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T | null> | T | null,
): boolean => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEventListener("mouseenter", () => setIsHovered(true), elementRef);
  useEventListener("mouseleave", () => setIsHovered(false), elementRef);

  return isHovered;
};
