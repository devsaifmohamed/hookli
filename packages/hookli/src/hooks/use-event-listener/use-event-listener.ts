import { useEffect, useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

/**
 * Subscribes to an event on a media query, the window, the document, or an
 * element ref, cleaning the listener up automatically.
 *
 * The target defaults to `window` when no `element` ref is given. The handler is
 * held in a ref so updating it never detaches and re-attaches the listener, and
 * the subscription lives inside an effect so the hook is SSR-safe.
 *
 * @param eventName - The event to listen for, typed against the target's map.
 * @param handler - Called with the typed event on every dispatch.
 * @param element - Optional ref to the target; defaults to `window`.
 * @param options - Standard `addEventListener` options.
 */
function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: RefObject<MediaQueryList>,
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
  element: RefObject<Document>,
  options?: boolean | AddEventListenerOptions,
): void;
function useEventListener<
  K extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
  T extends HTMLElement | SVGElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K] | SVGElementEventMap[K]) => void,
  element: RefObject<T>,
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
  element?: RefObject<T>,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement: T | Window =
      element?.current ?? (typeof window !== "undefined" ? window : undefined!);

    if (!targetElement?.addEventListener) return;

    const listener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, listener, options);

    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

export { useEventListener };
