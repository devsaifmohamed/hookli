import { useEffect, useState } from "react";

/** The battery snapshot returned by {@link useBattery}. */
export interface BatteryState {
  /** Whether the Battery Status API is available. */
  supported: boolean;
  /** Whether the first reading is still pending. */
  loading: boolean;
  /** Charge level from `0` to `1`, or `null`. */
  level: number | null;
  /** Whether the device is charging, or `null`. */
  charging: boolean | null;
  /** Seconds until fully charged, or `null`. */
  chargingTime: number | null;
  /** Seconds until empty, or `null`. */
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
 * @returns The current {@link BatteryState}.
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
