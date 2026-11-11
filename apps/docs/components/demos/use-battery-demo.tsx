"use client";

import { useBattery } from "hookli";
import { DemoReadout } from "./ui";

export function UseBatteryDocDemo() {
  const { supported, loading, level, charging } = useBattery();

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="API supported">
          <span className={supported ? "text-accent" : "text-gray-body"}>
            {String(supported)}
          </span>
        </DemoReadout>
        <DemoReadout label="loading">{String(loading)}</DemoReadout>
        <DemoReadout label="battery level">
          {level !== null ? `${Math.round(level * 100)}%` : "(unavailable)"}
        </DemoReadout>
        <DemoReadout label="charging status">
          {charging !== null ? (charging ? "Charging ⚡" : "Discharging") : "(unavailable)"}
        </DemoReadout>
      </dl>
      {!supported && (
        <p className="text-center text-xs text-gray-body">
          The Battery Status API is only supported in Chromium-based browsers (Chrome, Edge).
        </p>
      )}
    </div>
  );
}
