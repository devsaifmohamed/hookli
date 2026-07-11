"use client";

import { useState } from "react";
import { useGeoLocation } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. The hook
   asks the browser for a position the moment it mounts — including the
   permission prompt — so it stays unmounted until the button is clicked;
   never auto-request on page load. */
function CoordinatesReader() {
  const { location, error } = useGeoLocation();

  return (
    <dl>
      <DemoReadout label="status">
        {error ? "error" : location ? "located" : "locating…"}
      </DemoReadout>
      <DemoReadout label="latitude">
        {location ? location.coords.latitude.toFixed(4) : "null"}
      </DemoReadout>
      <DemoReadout label="longitude">
        {location ? location.coords.longitude.toFixed(4) : "null"}
      </DemoReadout>
      <DemoReadout label="error">{error ? error.message : "null"}</DemoReadout>
    </dl>
  );
}

export function UseGeoLocationDocDemo() {
  const [requested, setRequested] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {requested ? (
        <CoordinatesReader />
      ) : (
        <p className="font-mono text-xs leading-relaxed text-slate-syntax">
          Nothing runs until you click — your browser may then ask for
          permission. Denying it is part of the demo: the hook reports it via
          error instead of throwing.
        </p>
      )}
      <DemoButton onClick={() => setRequested((prev) => !prev)}>
        {requested ? "Reset" : "Request my location"}
      </DemoButton>
    </div>
  );
}
