import { useEffect, useState } from "react";

export interface NetworkState {
  online: boolean;
  /** Effective connection type (e.g. '4g'). */
  effectiveType?: string;
  /** Estimated bandwidth in megabits per second. */
  downlink?: number;
  /** Estimated round-trip time in milliseconds. */
  rtt?: number;
  /** Whether user enabled data-saving mode. */
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

// Node 21+ defines a partial `navigator` (no `onLine`), so check for a browser.
const isBrowser = () => typeof window !== "undefined" && typeof navigator !== "undefined";

const read = (): NetworkState => {
  if (!isBrowser()) return { online: true };
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
 * @category data
 * @keywords online, offline, network status, internet connection, connection type, navigator.onLine
 *
 * @example Usage
 * ```tsx
 * import { useNetworkState } from "hookli";
 *
 * export function Demo() {
 *   const { online, effectiveType, downlink } = useNetworkState();
 *
 *   return (
 *     <div>
 *       <p>Status: {online ? "Online" : "Offline"}</p>
 *       <p>Effective Type: {effectiveType ?? "unknown"}</p>
 *       <p>Downlink: {downlink ?? 0} Mbps</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useNetworkState = (): NetworkState => {
  const [state, setState] = useState<NetworkState>(() =>
    isBrowser() ? read() : { online: true },
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
