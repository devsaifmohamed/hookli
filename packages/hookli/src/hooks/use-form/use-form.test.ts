import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectSSRSafe } from "../../test-utils/ssr";
import { useForm } from "./use-form";

describe("useForm", () => {
  it("tracks values, handles change, and resets", () => {
    const { result } = renderHook(() => useForm({ name: "" }));
    expect(result.current.values.name).toBe("");
    act(() =>
      result.current.handleChange({
        target: { name: "name", value: "Ada" },
      } as never),
    );
    expect(result.current.values.name).toBe("Ada");
    act(() => result.current.resetForm());
    expect(result.current.values.name).toBe("");
  });

  it("server-renders without browser globals", async () => {
    await expectSSRSafe("useForm", { name: "" });
  });
});
