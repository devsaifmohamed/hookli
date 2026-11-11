"use client";

import { usePermission } from "hookli";
import { DemoReadout } from "./ui";

export function UsePermissionDocDemo() {
  const geoPermission = usePermission("geolocation" as PermissionName);
  const notifPermission = usePermission("notifications" as PermissionName);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="geolocation">
          <span
            className={
              geoPermission === "granted"
                ? "text-accent font-semibold"
                : "text-gray-body"
            }
          >
            {geoPermission}
          </span>
        </DemoReadout>
        <DemoReadout label="notifications">
          <span
            className={
              notifPermission === "granted"
                ? "text-accent font-semibold"
                : "text-gray-body"
            }
          >
            {notifPermission}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-center text-xs text-gray-body">
        Reports the live status from the browser Permissions API (&quot;granted&quot;, &quot;prompt&quot;, or &quot;denied&quot;).
      </p>
    </div>
  );
}
