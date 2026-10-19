import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "../use-isomorphic-layout-effect";

/** A point: translate px, or a `0..1` ratio of the bounds box when `unit` is `"ratio"`. */
export interface Position {
  x: number;
  y: number;
}

/**
 * Where a draggable element may go: `"parent"` (its parent's inner box), a ref
 * to any element's inner box, or explicit limits in translate px.
 */
export type DragBounds =
  | "parent"
  | RefObject<HTMLElement | null>
  | { left?: number; top?: number; right?: number; bottom?: number };

/** Options for {@link useDraggable}. */
export interface UseDraggableOptions {
  /**
   * How positions are expressed. `"px"` is the translate offset from the element's
   * layout spot. `"ratio"` is where the element's `anchor` point sits inside the
   * bounds box, `0..1` on each axis, so it survives the box resizing. `"ratio"`
   * needs element bounds (`"parent"` or a ref). Defaults to `"px"`.
   */
  unit?: "px" | "ratio";
  /** Controlled position. When set, the element only moves when this prop changes; pair it with `onChange`. */
  position?: Position;
  /** Uncontrolled starting position. Defaults to `{ x: 0, y: 0 }`. */
  initialPosition?: Position;
  /** Called whenever input (drag, jump, keys, `moveTo`) produces a new position. */
  onChange?: (position: Position) => void;
  /** Restrict movement to one axis. Defaults to `"both"`. */
  axis?: "x" | "y" | "both";
  /**
   * Keep the element inside a box. Element bounds are live: they are re-measured
   * on every gesture and whenever the element or the box resizes. Unbounded by default.
   */
  bounds?: DragBounds;
  /** Snap the translate offset to a `[x, y]` px grid. */
  grid?: [number, number];
  /** Ignore pointer and keyboard input (`moveTo` still works). Defaults to `false`. */
  disabled?: boolean;
  /**
   * Pressing an empty spot of the `containerRef` element makes the element jump
   * there, and holding the button keeps dragging. Defaults to `false`.
   */
  jumpOnClick?: boolean;
  /**
   * The element's reference point: what lands on the pointer when jumping, and
   * what a `"ratio"` position describes. Defaults to `"center"`.
   */
  anchor?: "center" | "top-left";
  /** Jump animation length in ms; `0` snaps instantly. Defaults to `200`. */
  transition?: number;
  /**
   * How softly the element trails the pointer while dragging, from `0` (glued to
   * the pointer) to just under `1` (very floaty). Defaults to `0.3`.
   */
  smoothing?: number;
  /** Arrow-key step in px (the grid step wins when `grid` is set); `false` disables. Defaults to `10`. */
  keyboardStep?: number | false;
  /** Called when a drag starts (including the drag that follows a jump). */
  onDragStart?: (position: Position) => void;
  /** Called on every drag move with the new position. */
  onDrag?: (position: Position) => void;
  /** Called when a drag ends, and after each keyboard move. */
  onDragEnd?: (position: Position) => void;
  /** Called when a click on the container makes the element jump. */
  onJump?: (position: Position) => void;
}

/** Options for {@link UseDraggableReturn.moveTo}. */
export interface MoveToOptions {
  /** Animate with the `transition` duration instead of snapping. Defaults to `false`. */
  animate?: boolean;
}

/** Return value of {@link useDraggable}. */
export interface UseDraggableReturn<T extends HTMLElement, C extends HTMLElement> {
  /** Callback ref for the draggable element. */
  ref: (node: T | null) => void;
  /** Callback ref for the canvas that `jumpOnClick` listens on. */
  containerRef: (node: C | null) => void;
  /** The current position, in `unit`s (the controlled `position` when one is passed). */
  position: Position;
  /** `true` while a pointer drag is in progress. */
  isDragging: boolean;
  /** Move the element programmatically, in `unit`s (bounds and grid still apply). */
  moveTo: (position: Position, options?: MoveToOptions) => void;
  /** Move the element back to `initialPosition`. */
  reset: () => void;
}

type Motion = "tween" | "follow" | "none";

interface Limits {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Geometry {
  /** The element's layout spot in the viewport (its rect minus the offset on screen). */
  origin: Position;
  width: number;
  height: number;
  /** The bounds element's inner box, when bounds are an element. */
  box: Box | null;
  limits: Limits | null;
}

interface DragSession {
  pointerId: number;
  start: Position;
  startPointer: Position;
  geometry: Geometry;
  last: Position;
}

const ORIGIN: Position = { x: 0, y: 0 };
const FRAME_MS = 1000 / 60;
const ARROWS: Record<string, Position> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const snap = (value: number, step: number) => (step > 0 ? Math.round(value / step) * step : value);
const same = (a: Position, b: Position) => a.x === b.x && a.y === b.y;
const near = (a: Position, b: Position) => Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const isPrimary = (event: PointerEvent) => event.button === 0 && event.isPrimary !== false;
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canAnimate = () => typeof requestAnimationFrame === "function" && !prefersReducedMotion();
const paint = (element: HTMLElement, { x, y }: Position) => {
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
};
// Limits written directly in translate px need no DOM read, so they can be re-read on every move.
const explicitLimits = (bounds: DragBounds | undefined): Limits | null =>
  bounds && bounds !== "parent" && !("current" in bounds)
    ? {
        minX: bounds.left ?? -Infinity,
        maxX: bounds.right ?? Infinity,
        minY: bounds.top ?? -Infinity,
        maxY: bounds.bottom ?? Infinity,
      }
    : null;
const boundsElement = (element: HTMLElement, bounds: DragBounds | undefined) =>
  bounds === "parent" ? element.parentElement : bounds && "current" in bounds ? bounds.current : null;

/**
 * Makes an element draggable with pointer events (mouse, touch and pen), with
 * optional axis lock, live bounds, grid snapping, arrow-key moves and smoothing.
 * With `jumpOnClick`, pressing an empty spot of the container makes the element
 * jump there (animated), and holding the button keeps dragging, like a slider.
 *
 * Works controlled (`position` + `onChange`) or uncontrolled (`initialPosition`),
 * in translate px or as a `0..1` ratio of the bounds box (`unit: "ratio"`).
 * The element is moved with `transform: translate3d()`, so layout is untouched.
 * Give it `tabIndex={0}` and an `aria-label` for keyboard use.
 *
 * @param options - See {@link UseDraggableOptions}.
 * @returns Refs to attach, the current `position`, `isDragging`, `moveTo` and `reset`.
 */
export const useDraggable = <
  T extends HTMLElement = HTMLElement,
  C extends HTMLElement = HTMLElement,
>(
  options: UseDraggableOptions = {},
): UseDraggableReturn<T, C> => {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const initialRef = useRef(options.initialPosition ?? ORIGIN);
  const { jumpOnClick = false, position: controlled } = options;

  const [element, setElement] = useState<T | null>(null);
  const [container, setContainer] = useState<C | null>(null);
  const [uncontrolled, setUncontrolled] = useState<Position>(initialRef.current);
  const [isDragging, setIsDragging] = useState(false);
  const position = controlled ?? uncontrolled;

  const elementRef = useRef<T | null>(null);
  elementRef.current = element;
  const positionRef = useRef(position); // public position, in `unit`s
  positionRef.current = position;
  const targetRef = useRef<Position>(ORIGIN); // translate px the element is heading to
  const renderedRef = useRef<Position>(ORIGIN); // translate px on screen right now
  const pendingRef = useRef<{ position: Position; motion: Motion } | null>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const tweenRef = useRef<{ from: Position; start: number | null } | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastFrameRef.current = null;
  }, []);

  // One rAF loop drives both the jump tween and the drag smoothing.
  const step = useCallback((time: number) => {
    frameRef.current = null;
    const node = elementRef.current;
    if (!node) return;
    const target = targetRef.current;
    const from = renderedRef.current;
    const last = lastFrameRef.current ?? time - FRAME_MS;
    lastFrameRef.current = time;

    let next: Position;
    const tween = tweenRef.current;
    if (tween) {
      if (tween.start === null) tween.start = time;
      const duration = optionsRef.current.transition ?? 200;
      const t = duration > 0 ? Math.min(1, (time - tween.start) / duration) : 1;
      const eased = easeOutCubic(t);
      next = {
        x: tween.from.x + (target.x - tween.from.x) * eased,
        y: tween.from.y + (target.y - tween.from.y) * eased,
      };
      if (t >= 1) tweenRef.current = null;
    } else {
      const smoothing = clamp(optionsRef.current.smoothing ?? 0.3, 0, 0.99);
      const k = 1 - Math.pow(smoothing, (time - last) / FRAME_MS);
      next = { x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k };
      if (Math.abs(target.x - next.x) < 0.1 && Math.abs(target.y - next.y) < 0.1) next = target;
    }

    renderedRef.current = next;
    paint(node, next);
    if (next === target && !tweenRef.current) lastFrameRef.current = null;
    else frameRef.current = requestAnimationFrame(step);
  }, []);

  // Point the element at a translate offset, animated or not. Never touches React state.
  const commit = useCallback(
    (next: Position, motion: Motion) => {
      targetRef.current = next;
      const node = elementRef.current;
      if (!node) {
        renderedRef.current = next;
        return;
      }
      const { transition = 200, smoothing = 0.3 } = optionsRef.current;
      const animate =
        canAnimate() &&
        ((motion === "tween" && transition > 0) ||
          (motion === "follow" && (smoothing > 0 || tweenRef.current !== null)));
      if (!animate) {
        stopFrame();
        tweenRef.current = null;
        renderedRef.current = next;
        paint(node, next);
        return;
      }
      if (motion === "tween") tweenRef.current = { from: renderedRef.current, start: null };
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(step);
    },
    [step, stopFrame],
  );

  const measure = (): Geometry | null => {
    const node = elementRef.current;
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const origin = { x: rect.left - renderedRef.current.x, y: rect.top - renderedRef.current.y };
    const { bounds } = optionsRef.current;
    const geometry: Geometry = { origin, width: rect.width, height: rect.height, box: null, limits: null };
    const explicit = explicitLimits(bounds);
    if (explicit) {
      geometry.limits = explicit;
      return geometry;
    }
    const boxElement = boundsElement(node, bounds);
    if (!boxElement) return geometry;
    const boxRect = boxElement.getBoundingClientRect();
    const box = {
      left: boxRect.left + boxElement.clientLeft,
      top: boxRect.top + boxElement.clientTop,
      width: boxElement.clientWidth || boxRect.width,
      height: boxElement.clientHeight || boxRect.height,
    };
    const minX = box.left - origin.x;
    const minY = box.top - origin.y;
    geometry.box = box;
    geometry.limits = {
      minX,
      maxX: Math.max(minX, box.left + box.width - rect.width - origin.x),
      minY,
      maxY: Math.max(minY, box.top + box.height - rect.height - origin.y),
    };
    return geometry;
  };

  const anchorOffset = (geometry: Geometry): Position =>
    (optionsRef.current.anchor ?? "center") === "center"
      ? { x: geometry.width / 2, y: geometry.height / 2 }
      : ORIGIN;

  // translate px → public units
  const toUnit = (px: Position, geometry: Geometry): Position => {
    const { box } = geometry;
    if (optionsRef.current.unit !== "ratio" || !box) return px;
    const offset = anchorOffset(geometry);
    return {
      x: box.width ? (geometry.origin.x + px.x + offset.x - box.left) / box.width : 0,
      y: box.height ? (geometry.origin.y + px.y + offset.y - box.top) / box.height : 0,
    };
  };

  // public units → translate px
  const fromUnit = (value: Position, geometry: Geometry): Position => {
    const { box } = geometry;
    if (optionsRef.current.unit !== "ratio" || !box) return value;
    const offset = anchorOffset(geometry);
    return {
      x: box.left + value.x * box.width - offset.x - geometry.origin.x,
      y: box.top + value.y * box.height - offset.y - geometry.origin.y,
    };
  };

  const constrain = (raw: Position, limits: Limits | null): Position => {
    const { grid } = optionsRef.current;
    let { x, y } = raw;
    if (grid) {
      x = snap(x, grid[0]);
      y = snap(y, grid[1]);
    }
    if (limits) {
      x = clamp(x, limits.minX, limits.maxX);
      y = clamp(y, limits.minY, limits.maxY);
    }
    return { x, y };
  };

  // Input produced a new offset: move now (uncontrolled) or ask the owner (controlled).
  const request = (next: Position, motion: Motion, geometry: Geometry): Position => {
    const value = toUnit(next, geometry);
    if (optionsRef.current.position !== undefined) {
      pendingRef.current = { position: value, motion };
    } else {
      commit(next, motion);
      setUncontrolled(value);
    }
    optionsRef.current.onChange?.(value);
    return value;
  };

  // Place the element at the public position, clamped to the current bounds. Runs on
  // mount, on every controlled change, and when the element or the box resizes.
  // A controlled change right after a request is the owner's answer to it, even when
  // the owner rounded or converted the value, so it gets the requested motion.
  const sync = useCallback((answer = false) => {
    const geometry = measure();
    if (!geometry) return;
    const session = sessionRef.current;
    if (session) session.geometry = geometry;
    const pending = answer ? pendingRef.current : null;
    if (answer) pendingRef.current = null;
    const value = positionRef.current;
    const motion = pending ? pending.motion : "none";
    const next = constrain(fromUnit(value, geometry), geometry.limits);
    if (!same(next, targetRef.current)) commit(next, motion);
    // Uncontrolled values follow the clamp, like a range input whose max shrinks.
    if (optionsRef.current.position === undefined) {
      const clamped = toUnit(next, geometry);
      if (!near(clamped, value)) setUncontrolled(clamped);
    }
    // measure/fromUnit/toUnit/constrain read only refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit]);

  const controlledX = controlled?.x;
  const controlledY = controlled?.y;
  useIsomorphicLayoutEffect(() => {
    if (element && controlledX !== undefined) sync(true);
  }, [element, controlledX, controlledY, sync]);

  // Paint before the first frame so the element never flashes at its layout spot.
  useIsomorphicLayoutEffect(() => {
    if (!element) return;
    paint(element, renderedRef.current);
    if (optionsRef.current.position === undefined) sync();
  }, [element, sync]);

  // Live bounds: re-place the element when it or its bounds box resizes.
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => sync());
    observer.observe(element);
    const box = boundsElement(element, optionsRef.current.bounds);
    if (box) observer.observe(box);
    return () => observer.disconnect();
  }, [element, sync]);

  useEffect(() => {
    if (!element) return;
    let previousUserSelect = "";

    const onMove = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      // No button held: it was released somewhere we never heard about.
      if (event.buttons === 0) {
        end();
        return;
      }
      const { axis = "both", bounds } = optionsRef.current;
      const { start, startPointer, geometry } = session;
      const next = constrain(
        {
          x: axis === "y" ? start.x : start.x + event.clientX - startPointer.x,
          y: axis === "x" ? start.y : start.y + event.clientY - startPointer.y,
        },
        explicitLimits(bounds) ?? geometry.limits,
      );
      if (same(next, session.last)) return;
      session.last = next;
      const value = request(next, "follow", geometry);
      optionsRef.current.onDrag?.(value);
    };

    const finish = () => {
      const ended = sessionRef.current;
      if (!ended) return null;
      sessionRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      window.removeEventListener("blur", end);
      element.removeEventListener("lostpointercapture", end);
      if (element.hasPointerCapture?.(ended.pointerId)) element.releasePointerCapture(ended.pointerId);
      document.body.style.userSelect = previousUserSelect;
      setIsDragging(false);
      return ended;
    };

    const end = () => {
      const ended = finish();
      if (ended) optionsRef.current.onDragEnd?.(toUnit(ended.last, ended.geometry));
    };

    const onEnd = (event: PointerEvent) => {
      if (event.pointerId === sessionRef.current?.pointerId) end();
    };

    const begin = (event: PointerEvent, start: Position, geometry: Geometry) => {
      sessionRef.current = {
        pointerId: event.pointerId,
        start,
        startPointer: { x: event.clientX, y: event.clientY },
        geometry,
        last: start,
      };
      previousUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      // Capture keeps pointerup coming even when it happens outside the window.
      try {
        element.setPointerCapture?.(event.pointerId);
      } catch {
        // Not an active pointer (synthetic event); the window listeners still work.
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      window.addEventListener("blur", end);
      element.addEventListener("lostpointercapture", end);
      setIsDragging(true);
      optionsRef.current.onDragStart?.(toUnit(start, geometry));
    };

    const onElementDown = (event: PointerEvent) => {
      if (optionsRef.current.disabled || sessionRef.current || !isPrimary(event)) return;
      const geometry = measure();
      if (geometry) begin(event, targetRef.current, geometry);
    };

    const onContainerDown = (event: PointerEvent) => {
      if (optionsRef.current.disabled || sessionRef.current || !isPrimary(event)) return;
      if (element.contains(event.target as Node)) return; // a normal drag, not a jump
      const geometry = measure();
      if (!geometry) return;
      const { axis = "both" } = optionsRef.current;
      const offset = anchorOffset(geometry);
      const current = targetRef.current;
      const next = constrain(
        {
          x: axis === "y" ? current.x : event.clientX - geometry.origin.x - offset.x,
          y: axis === "x" ? current.y : event.clientY - geometry.origin.y - offset.y,
        },
        geometry.limits,
      );
      const value = request(next, "tween", geometry);
      optionsRef.current.onJump?.(value);
      begin(event, next, geometry);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const { disabled, keyboardStep = 10, grid, axis = "both" } = optionsRef.current;
      const direction = ARROWS[event.key];
      if (disabled || keyboardStep === false || !direction) return;
      if ((axis === "x" && direction.y) || (axis === "y" && direction.x)) return;
      const geometry = measure();
      if (!geometry) return;
      event.preventDefault();
      const current = targetRef.current;
      const next = constrain(
        {
          x: current.x + direction.x * (grid ? grid[0] : keyboardStep),
          y: current.y + direction.y * (grid ? grid[1] : keyboardStep),
        },
        geometry.limits,
      );
      const value = request(next, "follow", geometry);
      optionsRef.current.onDragEnd?.(value);
    };

    const previousTouchAction = element.style.touchAction;
    element.style.touchAction = "none";
    element.addEventListener("pointerdown", onElementDown);
    element.addEventListener("keydown", onKeyDown);

    const canvas = jumpOnClick ? container : null;
    const previousCanvasTouchAction = canvas?.style.touchAction ?? "";
    if (canvas) {
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointerdown", onContainerDown);
    }

    return () => {
      finish();
      element.style.touchAction = previousTouchAction;
      element.removeEventListener("pointerdown", onElementDown);
      element.removeEventListener("keydown", onKeyDown);
      if (canvas) {
        canvas.style.touchAction = previousCanvasTouchAction;
        canvas.removeEventListener("pointerdown", onContainerDown);
      }
    };
    // measure/constrain/request/toUnit read only refs, so they are safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, container, jumpOnClick]);

  useEffect(() => stopFrame, [stopFrame]);

  const moveTo = useCallback((value: Position, moveOptions: MoveToOptions = {}) => {
    const geometry = measure();
    if (!geometry) {
      if (optionsRef.current.position === undefined) setUncontrolled(value);
      optionsRef.current.onChange?.(value);
      return;
    }
    request(
      constrain(fromUnit(value, geometry), geometry.limits),
      moveOptions.animate ? "tween" : "none",
      geometry,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => moveTo(initialRef.current), [moveTo]);

  return { ref: setElement, containerRef: setContainer, position, isDragging, moveTo, reset };
};
