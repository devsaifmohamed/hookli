import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useDarkMode } from "./use-dark-mode";

describe("useDarkMode", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = "";
  });

  it("toggles state and the body `dark` class", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.body.classList.contains("dark")).toBe(true);
  });
});
