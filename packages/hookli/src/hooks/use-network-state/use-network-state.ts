import { useEffect, useState } from "react";

/**
 * The network snapshot returned by {@link useNetworkState}. Connection details
 * come from the Network Information API and are `undefined` where unsupported.
 */
export interface NetworkState {
  /** Whether the browser is online (`navigator.onLine`). */
  online: boolean;
  /** Effective connection type, e.g. `"4g"` (if supported). */
  effectiveType?: string;
  /** Downlink speed estimate in Mbps (if supported). */
  downlink?: number;
  /** Round-trip time estimate in ms (if supported). */
  rtt?: number;
  /** Whether the user requested reduced data usage (if supported). */
  saveData?: boolean;
}

type ConnectionLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

const getConnection = (): ConnectionLike | undefined => {
  if (typeof navigator === "undefined") return undefined;
  return (
    (navigator as unknown as { connection?: ConnectionLike }).connection ??
    undefined
  );
};

const read = (): NetworkState => {
  if (typeof navigator === "undefined") return { online: true };
  const c = getConnection();
  return {
    online: navigator.onLine,
    effectiveType: c?.effectiveType,
    downlink: c?.downlink,
    rtt: c?.rtt,
    saveData: c?.saveData,
  };
};

/**
 * Tracks the browser's network state — online/offline plus connection details
 * where the Network Information API is available. Listeners attach in an effect,
 * so it is SSR-safe (returns `{ online: true }` on the server).
 *
 * @returns The current {@link NetworkState}.
 */
export const useNetworkState = (): NetworkState => {
  const [state, setState] = useState<NetworkState>(() =>
    typeof navigator === "undefined" ? { online: true } : read(),
  );

  useEffect(() => {
    const update = () => setState(read());
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const c = getConnection();
    c?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      c?.removeEventListener?.("change", update);
    };
  }, []);

  return state;
};
