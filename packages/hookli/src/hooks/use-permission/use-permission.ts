import { useEffect, useState } from "react";

/**
 * The result of {@link usePermission}: a standard `PermissionState`
 * (`"granted" | "denied" | "prompt"`), `"pending"` before the first read, or
 * `"unsupported"` where the Permissions API is unavailable.
 */
export type UsePermissionResult = PermissionState | "pending" | "unsupported";

/**
 * Queries the Permissions API for a permission and tracks its state reactively
 * (it updates if the user later changes the setting). SSR-safe; resolves to
 * `"unsupported"` where the API — or the specific permission — is unavailable.
 *
 * @category data
 * @keywords permission, permissions api, camera, microphone, notifications, geolocation permission,
 *   granted denied
 * @param name - The permission name to query (e.g. 'geolocation', 'notifications').
 * @returns status - The permission state ('granted', 'denied', 'prompt', 'pending', or
 *   'unsupported').
 *
 * @example Usage
 * ```tsx
 * import { usePermission } from "hookli";
 *
 * export function Demo() {
 *   const status = usePermission("geolocation");
 *
 *   return <p>Geolocation permission: {status}</p>;
 * }
 * ```
 */
export const usePermission = (name: PermissionName): UsePermissionResult => {
  const [state, setState] = useState<UsePermissionResult>("pending");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      setState("unsupported");
      return;
    }

    let status: PermissionStatus | null = null;
    let cancelled = false;
    const onChange = () => {
      if (status) setState(status.state);
    };

    navigator.permissions
      .query({ name })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setState(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => {
        if (!cancelled) setState("unsupported");
      });

    return () => {
      cancelled = true;
      status?.removeEventListener("change", onChange);
    };
  }, [name]);

  return state;
};
