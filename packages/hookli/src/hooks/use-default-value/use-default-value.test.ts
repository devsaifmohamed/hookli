import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDefault, useDefaultValue } from "./index";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useDefaultValue", () => {
  it("returns the value when set", () => {
    const { result } = renderHook(() => useDefaultValue("a", "fallback"));
    expect(result.current[0]).toBe("a");
  });

  it("falls back to the default when nullish", () => {
    const { result } = renderHook(() => useDefaultValue<string>(null, "fallback"));
    expect(result.current[0]).toBe("fallback");

    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");

    act(() => result.current[1](undefined));
    expect(result.current[0]).toBe("fallback");
  });

  it("provides backwards compatibility via useDefault alias", () => {
    expect(useDefault).toBe(useDefaultValue);
  });
});

describe("useDefaultValue on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useDefaultValue", null, 1);
  });
});
