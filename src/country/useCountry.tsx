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
  setCountry: (code: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryRaw] = useState<CountryCode>("IN");

  const setCountry = useCallback(
    (code: CountryCode) => setCountryRaw(code),
    [],
  );

  const value = useMemo<CountryContextValue>(
    () => ({ country, countryInfo: COUNTRIES[country], setCountry }),
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
