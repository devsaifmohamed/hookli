import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIntersectionObserver } from "./use-intersection-observer";

type Cb = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callbacks: Cb[];
let observe: ReturnType<typeof vi.fn>;
let disconnect: ReturnType<typeof vi.fn>;

const emit = (isIntersecting: boolean) => {
  act(() => {
    callbacks.forEach((cb) => cb([{ isIntersecting } as IntersectionObserverEntry]));
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
    takeRecords = vi.fn();
  }

  vi.stubGlobal("IntersectionObserver", MockObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIntersectionObserver", () => {
  it("uses the initial intersecting value before any report", () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialIsIntersecting: true }),
    );
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry).toBeNull();
  });

  it("observes once the ref is attached and reflects reported changes", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.ref(document.createElement("div"));
    });
    expect(observe).toHaveBeenCalledTimes(1);

    emit(true);
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.isIntersecting).toBe(true);

    emit(false);
    expect(result.current.isIntersecting).toBe(false);
  });

  it("calls onChange with each entry", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onChange }),
    );

    act(() => {
      result.current.ref(document.createElement("div"));
    });
    emit(true);

    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ isIntersecting: true }));
  });

  it("freezes after the first intersection when freezeOnceVisible is set", () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ freezeOnceVisible: true }),
    );

    act(() => {
      result.current.ref(document.createElement("div"));
    });
    emit(true);
    expect(result.current.isIntersecting).toBe(true);
    expect(disconnect).toHaveBeenCalled();

    emit(false);
    expect(result.current.isIntersecting).toBe(true);
  });

  it("disconnects on unmount", () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());
    act(() => {
      result.current.ref(document.createElement("div"));
    });

    disconnect.mockClear();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
