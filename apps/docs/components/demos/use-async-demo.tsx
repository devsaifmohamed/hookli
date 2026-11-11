"use client";

import { useAsync } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const fetchQuote = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return "Simulated async response at " + new Date().toLocaleTimeString();
};

export function UseAsyncDocDemo() {
  const { value, loading, error, execute } = useAsync(fetchQuote);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label="status">
          {loading ? (
            <span className="text-accent animate-pulse">Loading...</span>
          ) : error ? (
            <span className="text-red-400">Error: {error.message}</span>
          ) : (
            "Idle"
          )}
        </DemoReadout>
        <DemoReadout label="resolved value">{value ?? "(none)"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton disabled={loading} onClick={execute}>
          {loading ? "Running..." : "Run Again"}
        </DemoButton>
      </div>
    </div>
  );
}
