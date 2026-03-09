import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CountryCode = "IN" | "UK" | "US";

export interface CountryInfo {
  code: CountryCode;
  name: string;
  dialCode: string;
  currency: string;
  digitPattern: RegExp;
  placeholder: string;
  formatHint: string;
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  IN: {
    code: "IN",
    name: "India",
    dialCode: "+91",
    currency: "INR",
    digitPattern: /^\d{10}$/,
    placeholder: "98765 43210",
    formatHint: "10 digits",
  },
  UK: {
    code: "UK",
    name: "United Kingdom",
    dialCode: "+44",
    currency: "GBP",
    digitPattern: /^\d{10}$/,
    placeholder: "7911 123456",
    formatHint: "10 digits",
  },
  US: {
    code: "US",
    name: "United States",
    dialCode: "+1",
    currency: "USD",
    digitPattern: /^\d{10}$/,
    placeholder: "555 000 0000",
    formatHint: "10 digits",
  },
};

export const COUNTRY_LIST: CountryInfo[] = Object.values(COUNTRIES);
const COUNTRY_STORAGE_KEY = "femved.country";

let countryBootstrapPromise: Promise<CountryCode> | null = null;

function isCountryCode(value: string): value is CountryCode {
  return value === "IN" || value === "UK" || value === "US";
}

function normalizeCountryCode(rawCode: string | null | undefined): CountryCode {
  if (!rawCode) return "US";

  const upperCode = rawCode.trim().toUpperCase();
  if (upperCode === "GB") return "UK";
  if (isCountryCode(upperCode)) return upperCode;
  return "US";
}

function getStoredCountry(): CountryCode {
  if (typeof window === "undefined") return "US";
  const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
  return normalizeCountryCode(stored);
}

function persistCountry(code: CountryCode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, code);
}

async function fetchDetectedCountry(): Promise<CountryCode> {
  const response = await fetch("/.netlify/functions/country", {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!response.ok) {
    throw new Error(`Country lookup failed with status ${response.status}`);
  }

  const data = (await response.json()) as { countryCode?: string };
  return normalizeCountryCode(data.countryCode);
}

export function validatePhone(
  raw: string,
  country: CountryCode,
): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null; // optional field

  // Must not contain letters
  if (/[a-zA-Z]/.test(trimmed)) {
    return "Phone number must not contain letters.";
  }

  // Strip everything that isn't a digit
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 0) {
    return "Please enter a valid phone number.";
  }

  // Must not exceed 10 digits
  if (digits.length > 10) {
    return "Phone number must not be more than 10 digits.";
  }

  const info = COUNTRIES[country];
  if (!info.digitPattern.test(digits)) {
    return `Please enter a valid ${info.name} phone number (${info.formatHint}).`;
  }

  return null;
}

interface CountryContextValue {
  country: CountryCode;
  countryInfo: CountryInfo;
  isCountryReady: boolean;
  setCountry: (code: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const hasStoredCountry = (() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(COUNTRY_STORAGE_KEY));
  })();
  const [country, setCountryRaw] = useState<CountryCode>(() =>
    getStoredCountry(),
  );
  const [isCountryReady, setIsCountryReady] = useState<boolean>(hasStoredCountry);

  const setCountry = useCallback((code: CountryCode) => {
    const normalized = normalizeCountryCode(code);
    setCountryRaw(normalized);
    persistCountry(normalized);
    setIsCountryReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isActive = true;

    if (!countryBootstrapPromise) {
      countryBootstrapPromise = fetchDetectedCountry().catch(() => "US");
    }

    countryBootstrapPromise
      .then((resolvedCountry) => {
        if (!isActive) return;
        setCountryRaw(resolvedCountry);
        persistCountry(resolvedCountry);
        setIsCountryReady(true);
      })
      .catch(() => {
        // no-op: keep default "US" value if geolocation lookup fails
        if (!isActive) return;
        setIsCountryReady(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<CountryContextValue>(
    () => ({ country, countryInfo: COUNTRIES[country], isCountryReady, setCountry }),
    [country, isCountryReady, setCountry],
  );

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within <CountryProvider>");
  return ctx;
}
