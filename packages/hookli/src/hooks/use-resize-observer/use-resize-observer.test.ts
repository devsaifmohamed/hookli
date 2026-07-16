import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useResizeObserver } from "./use-resize-observer";

type Cb = (entries: Partial<ResizeObserverEntry>[]) => void;

let callbacks: Cb[];
let observe: ReturnType<typeof vi.fn>;
let disconnect: ReturnType<typeof vi.fn>;

const refTo = (el: HTMLElement) => {
  const ref = createRef<HTMLDivElement>();
  Object.defineProperty(ref, "current", { value: el, writable: true });
  return ref;
};

const emit = (width: number, height: number) => {
  act(() => {
    callbacks.forEach((cb) =>
      cb([
        {
          contentBoxSize: [{ inlineSize: width, blockSize: height }],
          contentRect: { width, height } as DOMRectReadOnly,
        } as unknown as ResizeObserverEntry,
      ]),
    );
  });
};

beforeEach(() => {
  callbacks = [];
  observe = vi.fn();
  disconnect = vi.fn();

  class MockObserver {
    private cb: Cb;
    constructor(cb: Cb) {
      this.cb = cb;
      callbacks.push(cb);
    }
    observe = observe;
    disconnect = () => {
      callbacks = callbacks.filter((c) => c !== this.cb);
      disconnect();
    };
    unobserve = vi.fn();
  }

  vi.stubGlobal("ResizeObserver", MockObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useResizeObserver", () => {
  it("starts with undefined dimensions", () => {
    const el = document.createElement("div");
    const { result } = renderHook(() => useResizeObserver(refTo(el)));
    expect(result.current).toEqual({ width: undefined, height: undefined });
  });

  it("reports measured dimensions", () => {
    const el = document.createElement("div");
    const { result } = renderHook(() => useResizeObserver(refTo(el)));
    expect(observe).toHaveBeenCalledTimes(1);

    emit(320, 240);
    expect(result.current).toEqual({ width: 320, height: 240 });
  });

  it("calls onResize with the new size", () => {
    const el = document.createElement("div");
    const onResize = vi.fn();
    renderHook(() => useResizeObserver(refTo(el), { onResize }));

    emit(100, 50);
    expect(onResize).toHaveBeenCalledWith({ width: 100, height: 50 });
  });

  it("ignores identical measurements", () => {
    const el = document.createElement("div");
    const onResize = vi.fn();
    renderHook(() => useResizeObserver(refTo(el), { onResize }));

    emit(100, 50);
    emit(100, 50);
    expect(onResize).toHaveBeenCalledTimes(1);
  });

  it("disconnects on unmount", () => {
    const el = document.createElement("div");
    const { unmount } = renderHook(() => useResizeObserver(refTo(el)));

    disconnect.mockClear();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
