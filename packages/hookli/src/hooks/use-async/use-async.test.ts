import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAsync } from "./use-async";

describe("useAsync", () => {
  it("runs on mount and sets the resolved value", async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42)));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.value).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it("captures errors", async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(new Error("boom"))),
    );
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toBe("boom");
  });

  it("does not run on mount when immediate is false", async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.resolve(1), false),
    );
    expect(result.current.loading).toBe(false);
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.value).toBe(1);
  });
});
