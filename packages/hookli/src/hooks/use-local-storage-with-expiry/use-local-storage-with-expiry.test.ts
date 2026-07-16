import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorageWithExpiry } from "./use-local-storage-with-expiry";

describe("useLocalStorageWithExpiry", () => {
  beforeEach(() => localStorage.clear());

  it("stores and returns the inner value", () => {
    const { result } = renderHook(() =>
      useLocalStorageWithExpiry<string | null>("k", null, 10_000),
    );
    act(() => result.current.setStoredValue("hi"));
    expect(result.current.value).toBe("hi");
  });
});
