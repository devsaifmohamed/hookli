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
 * @param name - The permission to query, e.g. `"geolocation"`, `"camera"`, `"notifications"`.
 * @returns The current permission state.
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
