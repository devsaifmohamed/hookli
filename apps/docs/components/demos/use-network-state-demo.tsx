"use client";

import { useNetworkState } from "hookli";
import { DemoReadout } from "./ui";

export function UseNetworkStateDocDemo() {
  const { online, effectiveType, downlink, rtt, saveData } = useNetworkState();

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="online">
          <span className={online ? "text-accent font-semibold" : "text-red-400"}>
            {online ? "Online" : "Offline"}
          </span>
        </DemoReadout>
        <DemoReadout label="effective type">{effectiveType ?? "unknown"}</DemoReadout>
        <DemoReadout label="downlink">{downlink !== undefined ? `${downlink} Mbps` : "n/a"}</DemoReadout>
        <DemoReadout label="round-trip time">{rtt !== undefined ? `${rtt} ms` : "n/a"}</DemoReadout>
        <DemoReadout label="save data">{saveData !== undefined ? String(saveData) : "n/a"}</DemoReadout>
      </dl>
      <p className="text-center text-xs text-gray-body">
        Toggle offline mode in browser DevTools Network tab to test connectivity transitions.
      </p>
    </div>
  );
}
