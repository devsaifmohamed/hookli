import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTernaryDarkMode } from "./use-ternary-dark-mode";

let prefersDark: boolean;

beforeEach(() => {
  prefersDark = false;
  window.localStorage.clear();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("dark") ? prefersDark : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTernaryDarkMode", () => {
  it("defaults to system with a light OS", () => {
    const { result } = renderHook(() => useTernaryDarkMode());
    expect(result.current.ternaryDarkMode).toBe("system");
    expect(result.current.isDarkMode).toBe(false);
  });

  it("resolves system to dark when the OS prefers dark", () => {
    prefersDark = true;
    const { result } = renderHook(() => useTernaryDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it("forces dark regardless of OS preference", () => {
    const { result } = renderHook(() => useTernaryDarkMode());

    act(() => {
      result.current.setTernaryDarkMode("dark");
    });

    expect(result.current.ternaryDarkMode).toBe("dark");
    expect(result.current.isDarkMode).toBe(true);
  });

  it("forces light regardless of OS preference", () => {
    prefersDark = true;
    const { result } = renderHook(() => useTernaryDarkMode());

    act(() => {
      result.current.setTernaryDarkMode("light");
    });

    expect(result.current.ternaryDarkMode).toBe("light");
    expect(result.current.isDarkMode).toBe(false);
  });

  it("cycles light -> system -> dark on toggle", () => {
    const { result } = renderHook(() => useTernaryDarkMode());

    act(() => {
      result.current.setTernaryDarkMode("light");
    });
    expect(result.current.ternaryDarkMode).toBe("light");

    act(() => {
      result.current.toggleTernaryDarkMode();
    });
    expect(result.current.ternaryDarkMode).toBe("system");

    act(() => {
      result.current.toggleTernaryDarkMode();
    });
    expect(result.current.ternaryDarkMode).toBe("dark");

    act(() => {
      result.current.toggleTernaryDarkMode();
    });
    expect(result.current.ternaryDarkMode).toBe("light");
  });

  it("honors a custom storage key", () => {
    const { result } = renderHook(() =>
      useTernaryDarkMode({ localStorageKey: "custom-key" }),
    );

    act(() => {
      result.current.setTernaryDarkMode("dark");
    });

    expect(window.localStorage.getItem("custom-key")).toBe(
      JSON.stringify("dark"),
    );
  });
});
