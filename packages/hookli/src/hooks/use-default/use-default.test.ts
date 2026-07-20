import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDefault } from "./use-default";

describe("useDefault", () => {
  it("returns the value when set", () => {
    const { result } = renderHook(() => useDefault("a", "fallback"));
    expect(result.current[0]).toBe("a");
  });

  it("falls back to the default when nullish", () => {
    const { result } = renderHook(() => useDefault<string>(null, "fallback"));
    expect(result.current[0]).toBe("fallback");

    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");

    act(() => result.current[1](undefined));
    expect(result.current[0]).toBe("fallback");
  });
});
