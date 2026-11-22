import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./use-fetch";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useFetch", () => {
  afterEach(() => vi.restoreAllMocks());

  it("moves from loading to resolved data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) }),
      ),
    );
    const { result } = renderHook(() => useFetch<{ id: number }>("/x"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1 });
  });
});

describe("useFetch on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useFetch", "http://127.0.0.1:9/never-called-on-server");
  });
});
