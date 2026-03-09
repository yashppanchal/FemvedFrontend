import {
  createContext,
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

// Indian language subtags (no region suffix) — all map to IN
const INDIAN_LANGUAGE_CODES = new Set([
  "hi", "mr", "gu", "ta", "te", "kn", "ml", "bn", "pa", "or", "as", "ur",
]);

function isCountryCode(value: string): value is CountryCode {
  return value === "IN" || value === "UK" || value === "US";
}

function normalizeCountryCode(rawCode: string | null | undefined): CountryCode {
  if (!rawCode) return "US";
  const upper = rawCode.trim().toUpperCase();
  if (upper === "GB") return "UK";
  if (isCountryCode(upper)) return upper;
  return "US";
}

/**
 * Detects the user's most likely country using browser APIs only —
 * no network call, no external service, runs synchronously.
 *
 * Strategy (in order):
 * 1. `navigator.languages` / `navigator.language` — locale region tag
 *    e.g. "en-IN" → IN, "en-GB" → UK, "en-US" → US
 * 2. Language subtag without region — Indian languages (hi, ta, …) → IN
 * 3. `Intl.DateTimeFormat` timezone — Asia/Kolkata → IN, Europe/London → UK
 * 4. Default → US
 */
function detectCountryFromBrowser(): CountryCode {
  if (typeof navigator === "undefined") return "US";

  const languages: string[] = (
    navigator.languages?.length ? [...navigator.languages] : [navigator.language]
  ).filter(Boolean);

  for (const lang of languages) {
    const parts = lang.split("-");
    const region = parts.length >= 2 ? parts[parts.length - 1] : null;

    // Explicit region tag — highest confidence
    if (region) {
      const code = normalizeCountryCode(region);
      // normalizeCountryCode defaults unknown regions to "US".
      // Return any positive match; treat a US match as confirmed (not just the default).
      return code;
    }

    // Language-only tag — use known Indian language codes
    const base = parts[0].toLowerCase();
    if (INDIAN_LANGUAGE_CODES.has(base)) return "IN";
  }

  // Timezone fallback (covers cases like "en" with no region)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "IN";
    if (tz === "Europe/London") return "UK";
  } catch {
    // Intl not supported — fall through to default
  }

  return "US";
}

/**
 * Returns the country to use on startup:
 * 1. Stored user preference (localStorage) — highest priority
 * 2. Browser-detected country — synchronous, no network
 */
function getInitialCountry(): CountryCode {
  if (typeof window === "undefined") return "US";
  const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
  if (stored) return normalizeCountryCode(stored);
  const detected = detectCountryFromBrowser();
  // Persist so subsequent page loads skip detection entirely
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, detected);
  return detected;
}

function persistCountry(code: CountryCode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, code);
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
  // Country is known synchronously at startup — no async wait required.
  const [country, setCountryRaw] = useState<CountryCode>(getInitialCountry);

  const setCountry = useCallback((code: CountryCode) => {
    const normalized = normalizeCountryCode(code);
    setCountryRaw(normalized);
    persistCountry(normalized);
  }, []);

  const value = useMemo<CountryContextValue>(
    () => ({
      country,
      countryInfo: COUNTRIES[country],
      isCountryReady: true, // always true — detection is synchronous
      setCountry,
    }),
    [country, setCountry],
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
