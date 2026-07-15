import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./use-media-query";

type ChangeListener = (event: Partial<MediaQueryListEvent>) => void;

let matchesFor: (query: string) => boolean;
let listeners: ChangeListener[];
let mqls: Array<{ query: string; setMatches: (value: boolean) => void }>;

beforeEach(() => {
  matchesFor = () => false;
  listeners = [];
  mqls = [];

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const mql = {
        matches: matchesFor(query),
        media: query,
        addEventListener: (_: string, cb: ChangeListener) => {
          listeners.push(cb);
        },
        removeEventListener: (_: string, cb: ChangeListener) => {
          listeners = listeners.filter((l) => l !== cb);
        },
      };
      mqls.push({
        query,
        setMatches: (value: boolean) => {
          mql.matches = value;
        },
      });
      return mql;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const emitChange = (matches: boolean) => {
  matchesFor = () => matches;
  mqls.forEach((m) => m.setMatches(matches));
  act(() => {
    listeners.forEach((cb) => cb({ matches }));
  });
};

describe("useMediaQuery", () => {
  it("reads the initial match synchronously", () => {
    matchesFor = () => true;
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)"),
    );
    expect(result.current).toBe(true);
  });

  it("uses defaultValue when initializeWithValue is false", () => {
    matchesFor = () => true;
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)", {
        initializeWithValue: false,
        defaultValue: false,
      }),
    );
    // Reconciles to the real value after the layout effect runs.
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)"),
    );
    expect(result.current).toBe(false);

    emitChange(true);
    expect(result.current).toBe(true);
  });

  it("detaches the change listener on unmount", () => {
    const { unmount } = renderHook(() =>
      useMediaQuery("(min-width: 768px)"),
    );
    expect(listeners.length).toBe(1);

    unmount();
    expect(listeners.length).toBe(0);
  });
});
