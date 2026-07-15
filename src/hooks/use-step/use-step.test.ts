import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStep } from "./use-step";

describe("useStep", () => {
  it("starts at step 1", () => {
    const { result } = renderHook(() => useStep(3));
    expect(result.current[0]).toBe(1);
    expect(result.current[1].canGoToPrevStep).toBe(false);
    expect(result.current[1].canGoToNextStep).toBe(true);
  });

  it("navigates forward and backward, clamped to bounds", () => {
    const { result } = renderHook(() => useStep(2));

    act(() => result.current[1].goToNextStep());
    expect(result.current[0]).toBe(2);
    expect(result.current[1].canGoToNextStep).toBe(false);

    // already at max — no-op
    act(() => result.current[1].goToNextStep());
    expect(result.current[0]).toBe(2);

    act(() => result.current[1].goToPrevStep());
    expect(result.current[0]).toBe(1);

    // already at min — no-op
    act(() => result.current[1].goToPrevStep());
    expect(result.current[0]).toBe(1);
  });

  it("setStep sets a valid step and reset returns to 1", () => {
    const { result } = renderHook(() => useStep(5));
    act(() => result.current[1].setStep(4));
    expect(result.current[0]).toBe(4);
    act(() => result.current[1].reset());
    expect(result.current[0]).toBe(1);
  });

  it("setStep throws when out of range", () => {
    const { result } = renderHook(() => useStep(3));
    expect(() => act(() => result.current[1].setStep(9))).toThrow();
  });
});
