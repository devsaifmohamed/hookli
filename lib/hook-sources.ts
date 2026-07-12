import { GITHUB_URL } from "@/lib/site";

/* Vendored implementation snapshots for the "Hook" section on every doc page
   (T16 usehooks-ts anatomy). Reconstructed faithfully from the installed
   hookli@1.3.16 bundle (node_modules/hookli/dist/index.mjs) with the exported
   type signatures from index.d.ts — bundler artifacts (helper prelude, aliased
   imports) removed so each entry reads as its original src/hooks/*.hook.ts.
   Keep in sync when the pinned hookli version changes. */

export type HookSource = {
  /* Repo-relative path, also the code-block filename. */
  path: string;
  source: string;
};

const REPO_BLOB = `${GITHUB_URL}/blob/main`;

const HOOK_SOURCES: Partial<Record<string, HookSource>> = {
  "use-toggle": {
    path: "src/hooks/useToggle.hook.ts",
    source: `import { useCallback, useState } from "react";

export const useToggle = (
  initialValue = false,
): [boolean, () => void, (value: boolean) => void] => {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  const setExplicit = useCallback((value: boolean) => {
    setState(value);
  }, []);

  return [state, toggle, setExplicit];
};
`,
  },
  "use-form": {
    path: "src/hooks/useForm.hook.ts",
    source: `import { ChangeEvent, useState } from "react";

interface UseFormValues {
  [key: string]: string | number | boolean;
}

export const useForm = <T extends UseFormValues>(initialState: T) => {
  const [values, setValues] = useState<T>(initialState);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const resetForm = () => {
    setValues(initialState);
  };

  return { values, handleChange, resetForm };
};
`,
  },
  "use-local-storage": {
    path: "src/hooks/useLocalStorage.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    const parsedValue = item ? JSON.parse(item) : initialValue;
    setValue(parsedValue);
  }, [key, initialValue]);

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    const updatedValue =
      newValue instanceof Function ? newValue(value) : newValue;
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
    setValue(updatedValue);
  };

  return { value, setStoredValue };
};
`,
  },
  "use-local-storage-with-expiry": {
    path: "src/hooks/useLocalStorageWithExpiry.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useLocalStorageWithExpiry = <T>(
  key: string,
  initialValue: T,
  expiryMs: number,
) => {
  const read = (): T | null => {
    if (typeof window === "undefined") return initialValue;

    const raw = window.localStorage.getItem(key);
    if (!raw) return initialValue;

    try {
      const item = JSON.parse(raw);
      if (
        item &&
        typeof item.expiry === "number" &&
        Date.now() > item.expiry
      ) {
        window.localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T | null>(initialValue);

  useEffect(() => {
    setValue(read());
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (typeof window === "undefined") return;

    const item = { value: newValue, expiry: Date.now() + expiryMs };
    window.localStorage.setItem(key, JSON.stringify(item));
  };

  return { value, setStoredValue };
};
`,
  },
  "use-dark-mode": {
    path: "src/hooks/useDarkMode.hook.ts",
    source: `import { useEffect, useState } from "react";

interface UseDarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useDarkMode = (): UseDarkModeState => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const bodyElement = document.body;
    const darkClass = "dark";

    bodyElement.classList.toggle(darkClass, isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    return () => {
      bodyElement.classList.remove(darkClass);
    };
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
`,
  },
  "use-debounce": {
    path: "src/hooks/useDebounce.hook.ts",
    source: `import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
`,
  },
  "use-click-outside": {
    path: "src/hooks/useClickOutside.hook.ts",
    source: `import { Ref, useEffect } from "react";

type ClickOutsideCallback = () => void;

export const useClickOutside = <T extends HTMLElement>(
  ref: Ref<T>,
  callback: ClickOutsideCallback,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref &&
        "current" in ref &&
        !ref.current?.contains(event.target as Node)
      ) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};
`,
  },
  "use-mouse-position": {
    path: "src/hooks/useMousePosition.hook.ts",
    source: `import { Ref, useEffect, useState } from "react";

interface MousePosition {
  x: number | null;
  y: number | null;
}

export const useMousePosition = <T extends HTMLElement>(
  ref: Ref<T>,
): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if (ref && "current" in ref && ref.current) {
        const { left, top } = ref.current.getBoundingClientRect();
        setMousePosition({ x: clientX - left, y: clientY - top });
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [ref]);

  return mousePosition;
};
`,
  },
  "use-infinite-scroll": {
    path: "src/hooks/useInfiniteScroll.hook.ts",
    source: `import { useEffect, useState } from "react";

type FetchMoreData = () => Promise<void>;

export const useInfiniteScroll = (fetchMoreData: FetchMoreData): boolean => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500;

      if (isNearBottom && !isFetching) {
        setIsFetching(true);
        fetchMoreData().then(() => setIsFetching(false));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, isFetching]);

  return isFetching;
};
`,
  },
  "use-fetch": {
    path: "src/hooks/useFetch.hook.ts",
    source: `import { useEffect, useState } from "react";

interface UseFetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export const useFetch = <T>(url: string): UseFetchResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};
`,
  },
  "use-geo-location": {
    path: "src/hooks/useGeoLocation.hook.ts",
    source: `import { useEffect, useState } from "react";

interface GeolocationError {
  code: number;
  message: string;
}

type GeolocationPosition = {
  coords: { latitude: number; longitude: number };
};

interface GeolocationState {
  location: GeolocationPosition | null;
  error: GeolocationError | Error | null;
}

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
      } catch (err) {
        setError(err as Error);
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
              () => getLocation(),
              (err) => setError(err),
            );
          } else {
            setError(new Error("Geolocation permission denied"));
          }
        })
        .catch((err) => setError(err));
    } else {
      setError(new Error("Geolocation is not supported by this browser."));
    }
  }, []);

  return { location, error };
};

function getCurrentPosition(): Promise<globalThis.GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
`,
  },
};

export function getHookSource(slug: string): HookSource | undefined {
  return HOOK_SOURCES[slug];
}

export function hookSourceUrl(path: string): string {
  return `${REPO_BLOB}/${path}`;
}
