import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMutation } from "./use-mutation";

describe("useMutation", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useMutation(async (n: number) => n));
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeNull();
  });

  it("runs the mutation and tracks success", async () => {
    const { result } = renderHook(() => useMutation(async (n: number) => n * 2));
    await act(async () => {
      const value = await result.current.mutate(21);
      expect(value).toBe(42);
    });
    expect(result.current.status).toBe("success");
    expect(result.current.data).toBe(42);
  });

  it("captures errors without throwing", async () => {
    const { result } = renderHook(() =>
      useMutation(async () => {
        throw new Error("nope");
      }),
    );
    await act(async () => {
      const value = await result.current.mutate();
      expect(value).toBeUndefined();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("nope");
  });

  it("resets", async () => {
    const { result } = renderHook(() => useMutation(async (n: number) => n));
    await act(async () => {
      await result.current.mutate(1);
    });
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeNull();
  });
});
