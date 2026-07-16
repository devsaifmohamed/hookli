import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("uses the initial value, then persists updates", () => {
    const { result } = renderHook(() => useLocalStorage("k", 1));
    expect(result.current.value).toBe(1);
    act(() => result.current.setStoredValue(2));
    expect(result.current.value).toBe(2);
    expect(JSON.parse(localStorage.getItem("k") as string)).toBe(2);
  });
});
