import { RefObject, useEffect, useRef } from "react";

type ClickOutsideCallback = () => void;

/**
 * Runs a callback on outside click.
 *
 * @category dom
 * @keywords click outside, outside click, dismiss, close dropdown, close popover, close menu, close
 *   modal
 * @param callback - Fires on every mousedown outside, even while your UI is closed: guard inside it.
 *
 * @example Usage
 * ```tsx
 * import { useRef, useState } from "react";
 * import { useClickOutside } from "hookli";
 *
 * export function Demo() {
 *   const menuRef = useRef<HTMLDivElement>(null);
 *   const [open, setOpen] = useState(false);
 *
 *   useClickOutside(menuRef, () => setOpen(false));
 *
 *   return (
 *     <div ref={menuRef}>
 *       <button onClick={() => setOpen((prev) => !prev)}>Actions</button>
 *       {open && (
 *         <ul role="menu">
 *           <li>Rename</li>
 *           <li>Duplicate</li>
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: React.Ref<T>,
  callback: ClickOutsideCallback
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref) {
        if (
          (ref as RefObject<T>) &&
          "current" in ref &&
          !ref?.current?.contains(event.target as Node)
        ) {
          callback();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};
