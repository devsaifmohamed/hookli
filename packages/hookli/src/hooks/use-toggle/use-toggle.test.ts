import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectSSRSafe } from "../../test-utils/ssr";
import { useToggle } from "./use-toggle";

describe("useToggle", () => {
  it("defaults to false and toggles", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it("honours the initial value and explicit set", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](false));
    expect(result.current[0]).toBe(false);
  });

  it("server-renders without browser globals", async () => {
    await expectSSRSafe("useToggle");
  });
});
