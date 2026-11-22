import { useEffect, useState } from "react";

export interface BatteryState {
  /** Whether the Battery Status API is supported in this browser. */
  supported: boolean;
  /** Whether initial battery status is being queried. */
  loading: boolean;
  /** Battery charge level between 0 and 1. */
  level: number | null;
  /** Whether the device is plugged in and charging. */
  charging: boolean | null;
  /** Seconds until battery is fully charged. */
  chargingTime: number | null;
  /** Seconds until battery is completely discharged. */
  dischargingTime: number | null;
}

interface BatteryManagerLike {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

const EVENTS = [
  "levelchange",
  "chargingchange",
  "chargingtimechange",
  "dischargingtimechange",
];

/**
 * Reads the device battery via the Battery Status API and keeps it updated.
 * SSR-safe and degrades gracefully: where the API is missing, `supported` is
 * `false` and the numeric fields stay `null`.
 *
 * @category data
 * @keywords battery, battery level, charging, power, low battery
 *
 * @example Usage
 * ```tsx
 * import { useBattery } from "hookli";
 *
 * export function Demo() {
 *   const { supported, level, charging } = useBattery();
 *
 *   if (!supported) return <p>Battery API not supported</p>;
 *
 *   return (
 *     <div>
 *       <p>Battery level: {level !== null ? Math.round(level * 100) : 0}%</p>
 *       <p>Charging: {charging ? "Yes" : "No"}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useBattery = (): BatteryState => {
  const [state, setState] = useState<BatteryState>({
    supported:
      typeof navigator !== "undefined" && "getBattery" in navigator,
    loading: true,
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
  });

  useEffect(() => {
    const getBattery = (
      navigator as unknown as {
        getBattery?: () => Promise<BatteryManagerLike>;
      }
    ).getBattery;

    if (!getBattery) {
      setState((prev) => ({ ...prev, supported: false, loading: false }));
      return;
    }

    let battery: BatteryManagerLike | null = null;
    let cancelled = false;
    const update = () => {
      if (!battery) return;
      setState({
        supported: true,
        loading: false,
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      });
    };

    void getBattery.call(navigator).then((result) => {
      if (cancelled) return;
      battery = result;
      update();
      for (const event of EVENTS) battery.addEventListener(event, update);
    });

    return () => {
      cancelled = true;
      if (battery) {
        for (const event of EVENTS) battery.removeEventListener(event, update);
      }
    };
  }, []);

  return state;
};
