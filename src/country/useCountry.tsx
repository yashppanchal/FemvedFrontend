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
/**
 * v2 key — written ONLY when the user explicitly changes country via the UI.
 * The old "femved.country" key was also written on auto-detection, so values
 * stored there cannot be trusted as explicit user choices. Migrating to a new
 * key ensures existing users with a stale auto-detected "US" get re-detected.
 */
const COUNTRY_STORAGE_KEY = "femved.country.explicit";

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
 * no network call, no explicit permission prompt, runs synchronously.
 *
 * Strategy (in priority order):
 * 1. IANA timezone name — most reliable passive geographic signal.
 *    Set by the OS, not the browser language preference, so Indian users
 *    who set their browser to "en-US" are still correctly identified.
 *    Covers India (Asia/Kolkata), UK and Crown Dependencies (Europe/London,
 *    Europe/Jersey, Europe/Guernsey, Europe/Isle_of_Man), and the Americas.
 * 2. UTC offset — UTC+5:30 uniquely identifies India even when the timezone
 *    name is unavailable (Intl polyfill environments).
 * 3. Intl.Locale region — parsed via the Intl.Locale API where available,
 *    which is more robust than manual string splitting.
 * 4. navigator.languages / navigator.language region tag — fallback locale
 *    parsing. Only explicitly recognised region codes match; unknown regions
 *    are skipped to avoid false positives (e.g. "en-AU" must not → US).
 * 5. Language-only subtag — Indian language codes (hi, mr, gu, ta, …) → IN.
 * 6. Default → US.
 */
function detectCountryFromBrowser(): CountryCode {
  // ── 1. IANA timezone name ───────────────────────────────────────────────
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
    // UK and its Crown Dependencies all use Europe/* names below
    if (
      tz === "Europe/London" ||
      tz === "Europe/Jersey" ||
      tz === "Europe/Guernsey" ||
      tz === "Europe/Isle_of_Man"
    ) return "UK";
    // America/* covers the whole Western Hemisphere — good enough for US default
    if (tz.startsWith("America/") || tz.startsWith("US/") || tz === "America") return "US";
  } catch {
    // Intl not available — fall through
  }

  // ── 2. UTC offset — UTC+5:30 is uniquely India ──────────────────────────
  try {
    // getTimezoneOffset() returns minutes WEST of UTC, so India is -330
    if (new Date().getTimezoneOffset() === -330) return "IN";
  } catch {
    // ignore
  }

  // ── 3 & 4. Locale / language tags ────────────────────────────────────────
  if (typeof navigator !== "undefined") {
    const rawLangs: string[] = (
      navigator.languages?.length ? [...navigator.languages] : []
    );
    if (rawLangs.length === 0 && navigator.language) rawLangs.push(navigator.language);
    // Intl.DateTimeFormat resolved locale — some browsers (Safari, Firefox) expose
    // a locale with a region suffix that differs from navigator.language.
    // e.g. a UK user in Safari might have navigator.language="en" but
    // Intl.DateTimeFormat().resolvedOptions().locale="en-GB".
    try {
      const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (intlLocale && !rawLangs.includes(intlLocale)) rawLangs.push(intlLocale);
    } catch { /* ignore */ }

    for (const lang of rawLangs.filter(Boolean)) {
      // 3. Intl.Locale — available in all modern browsers, parses BCP-47 tags reliably
      try {
        const locale = new Intl.Locale(lang);
        const region = locale.region?.toUpperCase();
        if (region === "IN") return "IN";
        if (region === "GB") return "UK";
        if (region === "US") return "US";
      } catch {
        // Intl.Locale not supported — fall through to manual parse
      }

      // 4. Manual split — last BCP-47 subtag is typically the region
      const parts = lang.split("-");
      const region = parts.length >= 2 ? parts[parts.length - 1].toUpperCase() : null;
      if (region === "IN") return "IN";
      if (region === "GB") return "UK";
      if (region === "US") return "US";

      // 5. Language-only tag — Indian language codes
      const base = parts[0].toLowerCase();
      if (INDIAN_LANGUAGE_CODES.has(base)) return "IN";
    }
  }

  // ── 6. Default ────────────────────────────────────────────────────────────
  return "US";
}

/**
 * Returns the country to use on startup:
 * 1. Explicit user preference (localStorage, set only when user manually changes country).
 * 2. Browser-detected country — timezone-first, synchronous, no network.
 *
 * Auto-detected country is NOT persisted to localStorage so that detection
 * runs fresh on each load. This prevents a stale "US" from locking in the
 * wrong country for users who were auto-detected incorrectly before.
 */
function getInitialCountry(): CountryCode {
  if (typeof window === "undefined") return "US";
  const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
  if (stored) return normalizeCountryCode(stored);
  // Detect fresh — do NOT write back to localStorage here.
  // Only setCountry() (explicit user action) persists the value.
  return detectCountryFromBrowser();
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
