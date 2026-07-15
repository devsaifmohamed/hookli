import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBoolean } from "./use-boolean";

describe("useBoolean", () => {
  it("defaults to false", () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);
  });

  it("honours the default value", () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });

  it("setTrue / setFalse / toggle work", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);

    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
  });

  it("setValue sets an explicit value", () => {
    const { result } = renderHook(() => useBoolean());
    act(() => result.current.setValue(true));
    expect(result.current.value).toBe(true);
  });
});
