import { useEffect, useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

/**
 * Subscribes to an event on a media query, the window, the document, or an
 * element, cleaning the listener up automatically.
 *
 * The target is a ref (`useRef`) or the element itself (for example from
 * `const [el, setEl] = useState(null)` and `ref={setEl}`, which also follows an
 * element that a child component mounts). While it is `null` nothing is
 * attached. Without a target the hook listens on `window`. The handler is held
 * in a ref so updating it never detaches and re-attaches the listener, and the
 * subscription lives inside an effect so the hook is SSR-safe.
 *
 * @param eventName - The event to listen for, typed against the target's map.
 * @param handler - Called with the typed event on every dispatch.
 * @param element - Optional ref or element to listen on; defaults to `window`.
 * @param options - Standard `addEventListener` options.
 */
function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: RefObject<MediaQueryList | null> | MediaQueryList | null,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: RefObject<Document | null> | Document | null,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<
  K extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
  T extends HTMLElement | SVGElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K] | SVGElementEventMap[K]) => void,
  element: RefObject<T | null> | T | null,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
  KM extends keyof MediaQueryListEventMap,
  KD extends keyof DocumentEventMap,
  T extends HTMLElement | SVGElement | MediaQueryList | Document = HTMLElement,
>(
  eventName: KW | KH | KM | KD,
  handler: (
    event:
      | WindowEventMap[KW]
      | HTMLElementEventMap[KH]
      | SVGElementEventMap[KH]
      | MediaQueryListEventMap[KM]
      | DocumentEventMap[KD]
      | Event,
  ) => void,
  element?: RefObject<T | null> | T | null,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // What is attached right now, so a render only re-subscribes when it changed.
  const attached = useRef<{
    target: EventTarget;
    eventName: string;
    options: typeof options;
    detach: () => void;
  } | null>(null);

  // No dependency array: a ref object never changes identity, so the element it
  // points to has to be re-read after every commit. Re-subscribing only happens
  // when the target, event or options actually changed.
  useEffect(() => {
    // No target given: window. A ref: its current element. An element: itself.
    // `null` (a ref not yet filled, or an element not yet mounted): nothing.
    const target: EventTarget | null =
      element === undefined
        ? typeof window !== "undefined"
          ? window
          : null
        : element === null || isEventTarget(element)
          ? element
          : element.current;

    const current = attached.current;
    if (current && current.target === target && current.eventName === eventName && current.options === options) {
      return;
    }

    current?.detach();
    attached.current = null;
    if (!target?.addEventListener) return;

    const listener = (event: Event) => savedHandler.current(event);
    target.addEventListener(eventName, listener, options);
    attached.current = {
      target,
      eventName,
      options,
      detach: () => target.removeEventListener(eventName, listener, options),
    };
  });

  // Detach on unmount.
  useEffect(
    () => () => {
      attached.current?.detach();
      attached.current = null;
    },
    [],
  );
}

const isEventTarget = (value: object): value is EventTarget =>
  typeof (value as EventTarget).addEventListener === "function";

export { useEventListener };
