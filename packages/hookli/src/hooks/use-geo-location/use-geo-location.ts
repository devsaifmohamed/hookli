import { useEffect, useState } from "react";

interface GeolocationError {
  /** Numeric error code mirrored from the browser's GeolocationPositionError. */
  code: number;
  message: string;
}

/** hookli's trimmed reading — only the coordinates, not the full browser GeolocationPosition. */
type GeolocationPosition = {
  coords: {
    /** Latitude in decimal degrees. */
    latitude: number;
    /** Longitude in decimal degrees. */
    longitude: number;
  };
};

interface GeolocationState {
  location: GeolocationPosition | null;
  error: GeolocationError | Error | null;
}

/**
 * Browser geolocation state.
 *
 * @category data
 * @keywords geolocation, location, gps, latitude longitude, coordinates, user location
 * @returns location - hookli's trimmed position type — just coords.latitude and coords.longitude.
 *   Null until the first reading arrives.
 * @returns error - Permission denials, unsupported browsers and failed lookups all land here — read
 *   .message for display. Requesting starts on mount, so mount the hook behind a user gesture.
 *
 * @example Usage
 * ```tsx
 * import { useState } from "react";
 * import { useGeoLocation } from "hookli";
 *
 * function Coordinates() {
 *   const { location, error } = useGeoLocation();
 *
 *   if (error) return <p>{error.message}</p>;
 *   if (!location) return <p>Locating…</p>;
 *
 *   const { latitude, longitude } = location.coords;
 *   return <p>{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>;
 * }
 *
 * export function Demo() {
 *   const [asked, setAsked] = useState(false);
 *
 *   // The hook may prompt for permission as soon as it mounts —
 *   // keep it unmounted until a user gesture.
 *   if (!asked) {
 *     return <button onClick={() => setAsked(true)}>Where am I?</button>;
 *   }
 *   return <Coordinates />;
 * }
 * ```
 */
export const useGeoLocation = (): GeolocationState => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | Error | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await getCurrentPosition();
        setLocation({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      } catch (error) {
        setError(error as GeolocationError); // Type assertion for clarity
      }
    };

    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            getLocation();
          } else if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              (position) => getLocation(),
              (err) => setError(err as GeolocationError) // Type assertion
            );
          } else {
            setError(new Error("Geolocation permission denied"));
          }
        })
        .catch((err) => setError(err as GeolocationError)); // Type assertion
    } else {
      setError(new Error("Geolocation is not supported by this browser."));
    }
  }, []);

  return { location, error };
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
