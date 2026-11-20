import { StrictMode, useRef } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useResizeObserver, type ResizeObserverSize } from "./use-resize-observer";

/* ------------------------------------------------------------------ */
/* Controllable fake ResizeObserver                                    */
/* ------------------------------------------------------------------ */

type ObservedCall = { el: Element; opts: ResizeObserverOptions | undefined };

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  readonly observed: ObservedCall[] = [];
  disconnectCalls = 0;
  /** true between observe() and disconnect(); a real RO never delivers while inactive. */
  active = false;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }
  observe(el: Element, opts?: ResizeObserverOptions) {
    this.observed.push({ el, opts });
    this.active = true;
  }
  unobserve() {}
  disconnect() {
    this.disconnectCalls += 1;
    this.active = false;
  }
  trigger(entries: ResizeObserverEntry[]) {
    if (!this.active) return;
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

const instances = () => FakeResizeObserver.instances;
const fire = (ro: FakeResizeObserver, entries: ResizeObserverEntry[]) =>
  act(() => ro.trigger(entries));

type Shape = "array" | "object";
type SizeKey = "contentBoxSize" | "borderBoxSize" | "devicePixelContentBoxSize";

/**
 * Builds an entry where every box reports a DIFFERENT value, so a hook that
 * picks the wrong branch fails. For (w, h):
 *   contentBoxSize              -> w x h
 *   borderBoxSize               -> (w+100) x (h+100)
 *   devicePixelContentBoxSize   -> (w+200) x (h+200)
 *   contentRect                 -> (w+300) x (h+300)
 */
const entry = (
  target: Element,
  w: number,
  h: number,
  shape: Shape = "array",
  omit: SizeKey[] = [],
): ResizeObserverEntry => {
  const size = (dw: number, dh: number) =>
    shape === "array" ? [{ inlineSize: dw, blockSize: dh }] : { inlineSize: dw, blockSize: dh };
  const e: Record<string, unknown> = {
    target,
    contentRect: { x: 0, y: 0, top: 0, left: 0, right: w + 300, bottom: h + 300, width: w + 300, height: h + 300 },
    contentBoxSize: size(w, h),
    borderBoxSize: size(w + 100, h + 100),
    devicePixelContentBoxSize: size(w + 200, h + 200),
  };
  for (const key of omit) delete e[key];
  return e as unknown as ResizeObserverEntry;
};

/* ------------------------------------------------------------------ */
/* Harness                                                             */
/* ------------------------------------------------------------------ */

type HarnessProps = {
  show: boolean;
  k: string;
  box?: ResizeObserverBoxOptions;
  onResize?: (size: ResizeObserverSize) => void;
  log: ResizeObserverSize[];
};

/** Renders one target div (optionally keyed) and records every render's size. */
function Harness({ show, k, box, onResize, log }: HarnessProps) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(ref, { box, onResize });
  log.push(size);
  return <>{show && <div key={k} ref={ref} data-testid="target" />}</>;
}

const target = () => document.querySelector<HTMLElement>('[data-testid="target"]');

type MountProps = Partial<Omit<HarnessProps, "log">>;

function mount(initial: MountProps = {}, strict = false) {
  const log: ResizeObserverSize[] = [];
  let current: MountProps = { show: true, k: "a", ...initial };
  const tree = () => {
    const node = <Harness log={log} show={current.show!} k={current.k!} box={current.box} onResize={current.onResize} />;
    return strict ? <StrictMode>{node}</StrictMode> : node;
  };
  const utils = render(tree());
  return {
    ...utils,
    log,
    last: () => log[log.length - 1],
    rerenderWith(patch: MountProps) {
      current = { ...current, ...patch };
      utils.rerender(tree());
    },
  };
}

beforeEach(() => {
  FakeResizeObserver.instances = [];
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;
});

afterEach(() => {
  cleanup();
  delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
});

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("useResizeObserver with late-mounted and swapped elements", () => {
  it("late mount: element appearing after a state change is observed once and reports size", () => {
    const h = mount({ show: false });
    expect(target()).toBeNull();
    expect(instances()).toHaveLength(0);
    expect(h.last()).toEqual({ width: undefined, height: undefined });

    h.rerenderWith({ show: true });
    const el = target();
    expect(el).not.toBeNull();
    expect(instances()).toHaveLength(1);
    const ro = instances()[0];
    expect(ro.observed).toHaveLength(1);
    expect(ro.observed[0].el).toBe(el);

    fire(ro, [entry(el!, 100, 50)]);
    expect(h.last()).toEqual({ width: 100, height: 50 });
  });

  it("swap A -> B (different key): old observer disconnected, B observed, B's size reported", () => {
    const h = mount({ k: "a" });
    const a = target()!;
    const ro1 = instances()[0];
    expect(ro1.observed[0].el).toBe(a);

    h.rerenderWith({ k: "b" });
    const b = target()!;
    expect(b).not.toBe(a);
    expect(ro1.disconnectCalls).toBe(1);
    expect(ro1.active).toBe(false);

    expect(instances()).toHaveLength(2);
    const ro2 = instances()[1];
    expect(ro2.observed).toHaveLength(1);
    expect(ro2.observed[0].el).toBe(b);

    fire(ro2, [entry(b, 80, 60)]);
    expect(h.last()).toEqual({ width: 80, height: 60 });
  });

  it("element removed: observer disconnected; remount is observed and same size is reported AGAIN", () => {
    const onResize = vi.fn();
    const h = mount({ onResize });
    const el1 = target()!;
    const ro1 = instances()[0];
    fire(ro1, [entry(el1, 100, 50)]);
    expect(onResize).toHaveBeenCalledTimes(1);

    h.rerenderWith({ show: false });
    expect(target()).toBeNull();
    expect(ro1.disconnectCalls).toBe(1);
    expect(ro1.active).toBe(false);
    expect(instances()).toHaveLength(1);

    h.rerenderWith({ show: true });
    const el2 = target()!;
    expect(instances()).toHaveLength(2);
    const ro2 = instances()[1];
    expect(ro2.observed).toHaveLength(1);
    expect(ro2.observed[0].el).toBe(el2);

    // Identical size to the last reported one: previous cache must have been reset.
    fire(ro2, [entry(el2, 100, 50)]);
    expect(onResize).toHaveBeenCalledTimes(2);
    expect(onResize).toHaveBeenLastCalledWith({ width: 100, height: 50 });
    expect(h.last()).toEqual({ width: 100, height: 50 });
  });

  it("component unmount: observer disconnected and never re-observed", () => {
    const h = mount();
    const ro = instances()[0];
    expect(ro.active).toBe(true);

    h.unmount();
    expect(ro.disconnectCalls).toBe(1);
    expect(ro.active).toBe(false);
    expect(instances()).toHaveLength(1);
    expect(ro.observed).toHaveLength(1);
    expect(() => fire(ro, [entry(document.createElement("div"), 10, 10)])).not.toThrow();
  });

  it("re-render with same element and same box creates no new observer", () => {
    const h = mount({ box: "content-box" });
    const ro = instances()[0];
    const before = h.log.length;

    h.rerenderWith({});
    h.rerenderWith({ box: "content-box" });
    h.rerenderWith({ onResize: vi.fn() }); // new callback identity is not a re-observe trigger
    expect(h.log.length).toBeGreaterThan(before); // re-renders really happened
    expect(instances()).toHaveLength(1);
    expect(ro.disconnectCalls).toBe(0);
    expect(ro.observed).toHaveLength(1);
  });

  it("box option change: old observer disconnected, new observe called with the new box", () => {
    const h = mount({ box: "content-box" });
    const el = target()!;
    const ro1 = instances()[0];
    expect(ro1.observed[0].opts).toEqual({ box: "content-box" });

    h.rerenderWith({ box: "border-box" });
    expect(ro1.disconnectCalls).toBe(1);
    expect(instances()).toHaveLength(2);
    const ro2 = instances()[1];
    expect(ro2.observed).toHaveLength(1);
    expect(ro2.observed[0].el).toBe(el);
    expect(ro2.observed[0].opts).toEqual({ box: "border-box" });

    fire(ro2, [entry(el, 100, 50)]);
    expect(h.last()).toEqual({ width: 200, height: 150 }); // border-box branch

    h.rerenderWith({ box: "device-pixel-content-box" });
    expect(ro2.disconnectCalls).toBe(1);
    expect(instances()[2].observed[0].opts).toEqual({ box: "device-pixel-content-box" });
  });

  it.each([
    ["content-box", "array", 100, 50],
    ["content-box", "object", 100, 50],
    ["border-box", "array", 200, 150],
    ["border-box", "object", 200, 150],
    ["device-pixel-content-box", "array", 300, 250],
    ["device-pixel-content-box", "object", 300, 250],
  ] as const)("box=%s with %s size reads the matching box branch", (box, shape, width, height) => {
    const h = mount({ box: box as ResizeObserverBoxOptions });
    const el = target()!;
    const ro = instances()[0];
    expect(ro.observed[0].opts).toEqual({ box });

    fire(ro, [entry(el, 100, 50, shape as Shape)]);
    expect(h.last()).toEqual({ width, height });
  });

  it.each([
    ["content-box", "contentBoxSize"],
    ["border-box", "borderBoxSize"],
    ["device-pixel-content-box", "devicePixelContentBoxSize"],
  ] as const)("box=%s with its box size missing falls back to contentRect", (box, key) => {
    const h = mount({ box: box as ResizeObserverBoxOptions });
    const el = target()!;
    const ro = instances()[0];

    fire(ro, [entry(el, 100, 50, "array", [key as SizeKey])]);
    expect(h.last()).toEqual({ width: 400, height: 350 }); // contentRect (w+300, h+300)
  });

  it("box size given as an empty array falls back to contentRect", () => {
    const h = mount({ box: "border-box" });
    const el = target()!;
    const ro = instances()[0];

    const e = entry(el, 100, 50) as unknown as { borderBoxSize: unknown };
    e.borderBoxSize = [];
    fire(ro, [e as unknown as ResizeObserverEntry]);
    expect(h.last()).toEqual({ width: 400, height: 350 });
  });

  it("entry callback with an empty array: no state change, no throw, no onResize", () => {
    const onResize = vi.fn();
    const h = mount({ onResize });
    const ro = instances()[0];
    const before = h.log.length;

    expect(() => fire(ro, [])).not.toThrow();
    expect(h.log.length).toBe(before);
    expect(onResize).not.toHaveBeenCalled();
    expect(h.last()).toEqual({ width: undefined, height: undefined });
  });

  it("same size reported twice: setSize/onResize only once (dedupe)", () => {
    const onResize = vi.fn();
    const h = mount({ onResize });
    const el = target()!;
    const ro = instances()[0];

    fire(ro, [entry(el, 100, 50)]);
    expect(onResize).toHaveBeenCalledTimes(1);
    const renders = h.log.length;

    fire(ro, [entry(el, 100, 50)]);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(h.log.length).toBe(renders); // no setSize -> no re-render

    // Changing only height is a real change.
    fire(ro, [entry(el, 100, 51)]);
    expect(onResize).toHaveBeenCalledTimes(2);
    expect(onResize).toHaveBeenLastCalledWith({ width: 100, height: 51 });
  });

  it("onResize prop change: latest callback is used and the observer is not recreated", () => {
    const first = vi.fn();
    const second = vi.fn();
    const h = mount({ onResize: first });
    const el = target()!;
    const ro = instances()[0];

    h.rerenderWith({ onResize: second });
    expect(instances()).toHaveLength(1);
    expect(ro.disconnectCalls).toBe(0);
    expect(ro.observed).toHaveLength(1);

    fire(ro, [entry(el, 100, 50)]);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith({ width: 100, height: 50 });
  });

  it("ResizeObserver undefined on globalThis: no throw, size stays undefined", () => {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    expect(typeof ResizeObserver).toBe("undefined");

    let h: ReturnType<typeof mount> | undefined;
    expect(() => {
      h = mount({});
    }).not.toThrow();
    expect(h!.last()).toEqual({ width: undefined, height: undefined });
    expect(() => h!.rerenderWith({ box: "border-box" })).not.toThrow();
    expect(() => h!.rerenderWith({ show: false })).not.toThrow();
    expect(instances()).toHaveLength(0);
    expect(h!.last()).toEqual({ width: undefined, height: undefined });
  });

  it("StrictMode: exactly one active observer after mount, zero after unmount", () => {
    const onResize = vi.fn();
    const h = mount({ onResize }, true);
    const active = () => instances().filter((i) => i.active);

    expect(active()).toHaveLength(1);
    const el = target()!;
    const live = active()[0];
    expect(live.observed.at(-1)?.el).toBe(el);

    fire(live, [entry(el, 100, 50)]);
    expect(h.last()).toEqual({ width: 100, height: 50 });
    expect(onResize).toHaveBeenCalledTimes(1);

    h.unmount();
    expect(active()).toHaveLength(0);
    expect(instances().every((i) => i.disconnectCalls >= 1 || i.observed.length === 0)).toBe(true);
  });

  it("regression: element present on first mount is observed and reports size", () => {
    const onResize = vi.fn();
    const h = mount({ onResize });
    const el = target()!;
    expect(instances()).toHaveLength(1);
    const ro = instances()[0];
    expect(ro.observed).toHaveLength(1);
    expect(ro.observed[0].el).toBe(el);
    expect(ro.observed[0].opts).toEqual({ box: "content-box" }); // default box

    fire(ro, [entry(el, 640, 480)]);
    expect(h.last()).toEqual({ width: 640, height: 480 });
    expect(onResize).toHaveBeenCalledWith({ width: 640, height: 480 });
  });
});
