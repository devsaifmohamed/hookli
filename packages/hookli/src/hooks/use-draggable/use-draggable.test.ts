import { act, cleanup, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDraggable, type UseDraggableOptions } from "./use-draggable";

// jsdom has no layout: the canvas is 500x300 at the viewport origin and the
// 40x40 element sits at (100, 50), shifted by whatever transform it carries.
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect;

const offsetOf = (element: HTMLElement) => {
  const match = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(element.style.transform);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 };
};

const setup = (options: UseDraggableOptions = {}) => {
  const canvas = document.createElement("div");
  const element = document.createElement("div");
  canvas.appendChild(element);
  document.body.appendChild(canvas);
  const size = { canvas: { width: 500, height: 300 }, element: { width: 40, height: 40 } };
  canvas.getBoundingClientRect = () => rect(0, 0, size.canvas.width, size.canvas.height);
  element.getBoundingClientRect = () => {
    const { x, y } = offsetOf(element);
    return rect(100 + x, 50 + y, size.element.width, size.element.height);
  };
  const hook = renderHook(
    (props: UseDraggableOptions) => useDraggable({ smoothing: 0, transition: 0, ...props }),
    { initialProps: options },
  );
  act(() => {
    hook.result.current.ref(element);
    hook.result.current.containerRef(canvas);
  });
  return { ...hook, canvas, element, size };
};

// A manual ResizeObserver: `resize()` fires every live observer.
const stubResizeObserver = () => {
  const callbacks = new Set<() => void>();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      private cb: () => void;
      constructor(cb: () => void) {
        this.cb = cb;
        callbacks.add(cb);
      }
      observe() {}
      disconnect() {
        callbacks.delete(this.cb);
      }
    },
  );
  return () => act(() => callbacks.forEach((cb) => cb()));
};

// `buttons` reports the held button, as real pointer events do (released on pointerup).
const pointer = (
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
  buttons = type === "pointerup" ? 0 : 1,
) =>
  act(() => {
    target.dispatchEvent(new MouseEvent(type, { clientX, clientY, button: 0, buttons, bubbles: true }));
  });

const drag = (element: HTMLElement, from: [number, number], to: [number, number]) => {
  pointer(element, "pointerdown", ...from);
  pointer(window, "pointermove", ...to);
  pointer(window, "pointerup", ...to);
};

// A manual rAF so animation frames run at exact timestamps.
const stubFrames = () => {
  let queue: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => queue.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {
    queue = [];
  });
  return (time: number) =>
    act(() => {
      const due = queue;
      queue = [];
      due.forEach((cb) => cb(time));
    });
};

describe("useDraggable", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("follows the pointer and reports drag lifecycle", () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const { result, element } = setup({ onDragStart, onDragEnd });

    pointer(element, "pointerdown", 120, 70);
    expect(result.current.isDragging).toBe(true);
    expect(onDragStart).toHaveBeenCalledWith({ x: 0, y: 0 });

    pointer(window, "pointermove", 150, 90);
    expect(result.current.position).toEqual({ x: 30, y: 20 });
    expect(element.style.transform).toBe("translate3d(30px, 20px, 0)");

    pointer(window, "pointerup", 150, 90);
    expect(result.current.isDragging).toBe(false);
    expect(onDragEnd).toHaveBeenCalledWith({ x: 30, y: 20 });
  });

  it("locks movement to one axis", () => {
    const { result, element } = setup({ axis: "x" });
    drag(element, [120, 70], [150, 90]);
    expect(result.current.position).toEqual({ x: 30, y: 0 });
  });

  it("snaps to the grid", () => {
    const { result, element } = setup({ grid: [25, 25] });
    drag(element, [120, 70], [150, 90]);
    expect(result.current.position).toEqual({ x: 25, y: 25 });
  });

  it("clamps inside the parent", () => {
    const { result, element } = setup({ bounds: "parent" });
    drag(element, [120, 70], [-1000, -1000]);
    expect(result.current.position).toEqual({ x: -100, y: -50 });
    drag(element, [20, 20], [5000, 5000]);
    expect(result.current.position).toEqual({ x: 360, y: 210 });
  });

  it("jumps to a clicked spot, centered on the pointer", () => {
    const onJump = vi.fn();
    const { result, canvas } = setup({ jumpOnClick: true, onJump });
    pointer(canvas, "pointerdown", 300, 200);
    expect(result.current.position).toEqual({ x: 180, y: 130 });
    expect(onJump).toHaveBeenCalledWith({ x: 180, y: 130 });
  });

  it("lands the top-left corner when anchor is top-left", () => {
    const { result, canvas } = setup({ jumpOnClick: true, anchor: "top-left" });
    pointer(canvas, "pointerdown", 300, 200);
    expect(result.current.position).toEqual({ x: 200, y: 150 });
  });

  it("does not jump when the press starts on the element", () => {
    const onJump = vi.fn();
    const { result, element } = setup({ jumpOnClick: true, onJump });
    pointer(element, "pointerdown", 120, 70);
    expect(onJump).not.toHaveBeenCalled();
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("keeps dragging after a jump while the button is held", () => {
    const { result, canvas } = setup({ jumpOnClick: true });
    pointer(canvas, "pointerdown", 300, 200);
    expect(result.current.isDragging).toBe(true);
    pointer(window, "pointermove", 310, 215);
    expect(result.current.position).toEqual({ x: 190, y: 145 });
  });

  it("animates a jump over the transition duration", () => {
    const frame = stubFrames();
    const { result, canvas, element } = setup({ jumpOnClick: true, transition: 100 });
    pointer(canvas, "pointerdown", 300, 200);
    expect(result.current.position).toEqual({ x: 180, y: 130 }); // target is immediate
    frame(0);
    expect(offsetOf(element)).toEqual({ x: 0, y: 0 });
    frame(50);
    const midway = offsetOf(element).x;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(180);
    frame(100);
    expect(offsetOf(element)).toEqual({ x: 180, y: 130 });
  });

  it("smooths the drag so the element eases toward the pointer", () => {
    const frame = stubFrames();
    const { element } = setup({ smoothing: 0.5 });
    pointer(element, "pointerdown", 120, 70);
    pointer(window, "pointermove", 220, 70);
    expect(offsetOf(element).x).toBe(0);
    frame(1000);
    expect(offsetOf(element).x).toBeCloseTo(50);
    frame(1000 + 1000 / 60);
    expect(offsetOf(element).x).toBeCloseTo(75);
    for (let i = 2; i < 20; i++) frame(1000 + (i * 1000) / 60);
    expect(offsetOf(element).x).toBe(100);
  });

  it("skips animation when the user prefers reduced motion", () => {
    stubFrames();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { canvas, element } = setup({ jumpOnClick: true, transition: 300, smoothing: 0.5 });
    pointer(canvas, "pointerdown", 300, 200);
    expect(offsetOf(element)).toEqual({ x: 180, y: 130 });
  });

  it("moves with the arrow keys", () => {
    const { result, element } = setup();
    act(() => {
      element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(result.current.position).toEqual({ x: 10, y: 0 });
  });

  it("uses the grid step for arrow keys", () => {
    const { result, element } = setup({ grid: [25, 25] });
    act(() => {
      element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(result.current.position).toEqual({ x: 0, y: 25 });
  });

  it("ignores input when disabled", () => {
    const { result, element } = setup({ disabled: true });
    drag(element, [120, 70], [150, 90]);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("moves programmatically and resets", () => {
    const { result, element } = setup({ initialPosition: { x: 5, y: 5 } });
    expect(element.style.transform).toBe("translate3d(5px, 5px, 0)");
    act(() => result.current.moveTo({ x: 40, y: 60 }));
    expect(result.current.position).toEqual({ x: 40, y: 60 });
    act(() => result.current.reset());
    expect(result.current.position).toEqual({ x: 5, y: 5 });
  });

  it("cleans up a drag in progress on unmount", () => {
    const { result, element, unmount } = setup();
    pointer(element, "pointerdown", 120, 70);
    expect(document.body.style.userSelect).toBe("none");
    unmount();
    expect(document.body.style.userSelect).toBe("");
    pointer(window, "pointermove", 300, 300);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("reports every change through onChange when uncontrolled", () => {
    const onChange = vi.fn();
    const { element } = setup({ onChange });
    drag(element, [120, 70], [150, 90]);
    expect(onChange).toHaveBeenLastCalledWith({ x: 30, y: 20 });
  });

  describe("controlled", () => {
    it("asks the owner instead of moving, then follows the prop", () => {
      const onChange = vi.fn();
      const { result, element, rerender } = setup({ position: { x: 0, y: 0 }, onChange });
      pointer(element, "pointerdown", 120, 70);
      pointer(window, "pointermove", 150, 90);
      expect(onChange).toHaveBeenCalledWith({ x: 30, y: 20 });
      expect(offsetOf(element)).toEqual({ x: 0, y: 0 }); // not moved until the owner agrees
      expect(result.current.position).toEqual({ x: 0, y: 0 });

      rerender({ position: { x: 30, y: 20 }, onChange });
      expect(offsetOf(element)).toEqual({ x: 30, y: 20 });
      expect(result.current.position).toEqual({ x: 30, y: 20 });
      expect(onChange).toHaveBeenCalledTimes(1); // no echo from the prop update
    });

    it("moves on external prop changes without calling onChange", () => {
      const onChange = vi.fn();
      const { element, rerender } = setup({ position: { x: 0, y: 0 }, onChange });
      rerender({ position: { x: 70, y: 10 }, onChange });
      expect(offsetOf(element)).toEqual({ x: 70, y: 10 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("stays put when the owner rejects a change", () => {
      const { element, rerender } = setup({ position: { x: 0, y: 0 }, onChange: () => {} });
      drag(element, [120, 70], [150, 90]);
      rerender({ position: { x: 0, y: 0 }, onChange: () => {} });
      expect(offsetOf(element)).toEqual({ x: 0, y: 0 });
    });

    it("routes moveTo through onChange", () => {
      const onChange = vi.fn();
      const { result } = setup({ position: { x: 0, y: 0 }, onChange });
      act(() => result.current.moveTo({ x: 12, y: 34 }));
      expect(onChange).toHaveBeenCalledWith({ x: 12, y: 34 });
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe("ratio unit", () => {
    it("places the anchor at a fraction of the bounds box", () => {
      const { element, result } = setup({
        unit: "ratio",
        bounds: "parent",
        initialPosition: { x: 0.5, y: 0.5 },
      });
      // centre (250, 150) minus half the element, minus its layout spot (100, 50)
      expect(offsetOf(element)).toEqual({ x: 130, y: 80 });
      expect(result.current.position).toEqual({ x: 0.5, y: 0.5 });
    });

    it("reports drags and jumps as ratios", () => {
      const onJump = vi.fn();
      const { result, canvas, element } = setup({
        unit: "ratio",
        bounds: "parent",
        jumpOnClick: true,
        onJump,
      });
      pointer(canvas, "pointerdown", 300, 150);
      expect(onJump).toHaveBeenCalledWith({ x: 0.6, y: 0.5 });
      pointer(window, "pointermove", 350, 150);
      pointer(window, "pointerup", 350, 150);
      expect(result.current.position).toEqual({ x: 0.7, y: 0.5 });
      expect(offsetOf(element)).toEqual({ x: 230, y: 80 });
    });

    it("keeps the same spot when the box resizes", () => {
      const resize = stubResizeObserver();
      const { element, result, size } = setup({
        unit: "ratio",
        bounds: "parent",
        initialPosition: { x: 0.5, y: 0.5 },
      });
      size.canvas = { width: 1000, height: 600 };
      resize();
      expect(offsetOf(element)).toEqual({ x: 380, y: 230 });
      expect(result.current.position).toEqual({ x: 0.5, y: 0.5 });
    });
  });

  it("re-clamps live when the element grows, like a range input", () => {
    const resize = stubResizeObserver();
    const onChange = vi.fn();
    const { element, result, size } = setup({ bounds: "parent", onChange });
    drag(element, [120, 70], [5000, 70]);
    expect(result.current.position.x).toBe(360);
    onChange.mockClear();
    size.element = { width: 140, height: 40 };
    resize();
    expect(offsetOf(element).x).toBe(260);
    expect(result.current.position.x).toBe(260);
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("ending a drag we never saw released", () => {
    it("ends when the window loses focus", () => {
      const onDragEnd = vi.fn();
      const { result, element } = setup({ onDragEnd });
      pointer(element, "pointerdown", 120, 70);
      pointer(window, "pointermove", 150, 90);
      act(() => {
        window.dispatchEvent(new Event("blur"));
      });
      expect(result.current.isDragging).toBe(false);
      expect(onDragEnd).toHaveBeenCalledWith({ x: 30, y: 20 });
      pointer(window, "pointermove", 300, 300);
      expect(result.current.position).toEqual({ x: 30, y: 20 });
    });

    it("ends when the pointer comes back with no button held", () => {
      const onDragEnd = vi.fn();
      const { result, element } = setup({ onDragEnd });
      pointer(element, "pointerdown", 120, 70);
      pointer(window, "pointermove", 150, 90);
      pointer(window, "pointermove", 400, 200, 0); // released outside the window
      expect(result.current.isDragging).toBe(false);
      expect(result.current.position).toEqual({ x: 30, y: 20 });
      expect(onDragEnd).toHaveBeenCalledTimes(1);
    });

    it("ends when pointer capture is lost", () => {
      const { result, element } = setup();
      pointer(element, "pointerdown", 120, 70);
      act(() => {
        element.dispatchEvent(new Event("lostpointercapture"));
      });
      expect(result.current.isDragging).toBe(false);
    });
  });

  it("gives a controlled owner that rounds the requested follow motion", () => {
    const frame = stubFrames();
    const onChange = vi.fn();
    const { element, rerender } = setup({ position: { x: 0, y: 0 }, onChange, smoothing: 0.5 });
    pointer(element, "pointerdown", 120, 70);
    pointer(window, "pointermove", 220.4, 70);
    expect(onChange).toHaveBeenLastCalledWith({ x: 100.4, y: 0 });
    // The owner stores whole pixels, so its answer never equals the request.
    rerender({ position: { x: 100, y: 0 }, onChange, smoothing: 0.5 });
    expect(offsetOf(element).x).toBe(0); // eased, not snapped
    frame(1000);
    expect(offsetOf(element).x).toBeCloseTo(50);
    for (let i = 1; i < 20; i++) frame(1000 + (i * 1000) / 60);
    expect(offsetOf(element).x).toBe(100);
  });

  it("snaps a controlled change that answers no request", () => {
    stubFrames();
    const { element, rerender } = setup({ position: { x: 0, y: 0 }, onChange: () => {}, smoothing: 0.5 });
    rerender({ position: { x: 80, y: 0 }, onChange: () => {}, smoothing: 0.5 });
    expect(offsetOf(element).x).toBe(80);
  });

  describe("bounds that change mid-drag", () => {
    it("clamps the next move to shrunk explicit bounds", () => {
      const { result, element, rerender } = setup({ bounds: { right: 200 } });
      pointer(element, "pointerdown", 120, 70);
      pointer(window, "pointermove", 270, 70);
      expect(result.current.position.x).toBe(150);
      rerender({ bounds: { right: 50 } });
      pointer(window, "pointermove", 280, 70);
      expect(result.current.position.x).toBe(50);
    });

    it("clamps the next move when the bounds box shrinks", () => {
      const resize = stubResizeObserver();
      const { result, element, size } = setup({ bounds: "parent" });
      pointer(element, "pointerdown", 120, 70);
      pointer(window, "pointermove", 320, 70);
      expect(result.current.position.x).toBe(200);
      size.canvas = { width: 250, height: 300 };
      resize();
      pointer(window, "pointermove", 330, 70);
      expect(result.current.position.x).toBe(110); // 250 - 40 wide - 100 layout spot
    });
  });

  it("renders on the server without touching the DOM", () => {
    const Probe = () => {
      useDraggable({ jumpOnClick: true });
      return null;
    };
    expect(() => renderToString(createElement(Probe))).not.toThrow();
  });
});
