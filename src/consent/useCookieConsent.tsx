import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export interface CookieConsentPreferences {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface StoredCookieConsent {
  version: string;
  updatedAt: string;
  preferences: CookieConsentPreferences;
}

interface CookieConsentContextValue {
  preferences: CookieConsentPreferences;
  hasUserMadeChoice: boolean;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (next: Omit<CookieConsentPreferences, "necessary">) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  allows: (category: Exclude<ConsentCategory, "necessary">) => boolean;
}

const COOKIE_CONSENT_STORAGE_KEY = "fv_cookie_consent";
const COOKIE_CONSENT_COOKIE_NAME = "fv_cookie_consent";
const COOKIE_CONSENT_META_COOKIE_NAME = "fv_consent_updated_at";
const COOKIE_CONSENT_VERSION = "2026-04";
const COOKIE_MAX_AGE_DAYS = 180;

const defaultPreferences: CookieConsentPreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function parseStoredConsent(raw: string | null): StoredCookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCookieConsent>;
    if (!parsed || typeof parsed !== "object") return null;

    const prefs = parsed.preferences as Partial<CookieConsentPreferences> | undefined;
    if (!prefs) return null;

    return {
      version: typeof parsed.version === "string" ? parsed.version : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      preferences: {
        necessary: true,
        preferences: Boolean(prefs.preferences),
        analytics: Boolean(prefs.analytics),
        marketing: Boolean(prefs.marketing),
      },
    };
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === "undefined") return;
  const maxAgeSeconds = Math.max(1, Math.floor(maxAgeDays * 24 * 60 * 60));
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax; Secure`;
}

function buildStoredConsent(preferences: CookieConsentPreferences): StoredCookieConsent {
  return {
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    preferences,
  };
}

function readInitialConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;

  const fromStorage = parseStoredConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  if (fromStorage) return fromStorage;

  const fromCookie = parseStoredConsent(getCookie(COOKIE_CONSENT_COOKIE_NAME));
  return fromCookie;
}

function persistConsent(stored: StoredCookieConsent): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(stored));
  }
  setCookie(COOKIE_CONSENT_COOKIE_NAME, JSON.stringify(stored), COOKIE_MAX_AGE_DAYS);
  setCookie(COOKIE_CONSENT_META_COOKIE_NAME, stored.updatedAt, COOKIE_MAX_AGE_DAYS);
}

function dispatchConsentChanged(stored: StoredCookieConsent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("femved:consent-changed", {
      detail: stored,
    }),
  );
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const initial = readInitialConsent();
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(
    initial?.preferences ?? defaultPreferences,
  );
  const [hasUserMadeChoice, setHasUserMadeChoice] = useState(Boolean(initial));
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const storeAndPublishConsent = useCallback((next: CookieConsentPreferences) => {
    const stored = buildStoredConsent(next);
    persistConsent(stored);
    setPreferences(next);
    setHasUserMadeChoice(true);
    dispatchConsentChanged(stored);
  }, []);

  const acceptAll = useCallback(() => {
    storeAndPublishConsent({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    });
    setIsPreferencesOpen(false);
  }, [storeAndPublishConsent]);

  const rejectNonEssential = useCallback(() => {
    storeAndPublishConsent(defaultPreferences);
    setIsPreferencesOpen(false);
  }, [storeAndPublishConsent]);

  const savePreferences = useCallback(
    (next: Omit<CookieConsentPreferences, "necessary">) => {
      storeAndPublishConsent({
        necessary: true,
        preferences: Boolean(next.preferences),
        analytics: Boolean(next.analytics),
        marketing: Boolean(next.marketing),
      });
      setIsPreferencesOpen(false);
    },
    [storeAndPublishConsent],
  );

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  useEffect(() => {
    if (!isPreferencesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreferencesOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPreferencesOpen]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      hasUserMadeChoice,
      isBannerVisible: !hasUserMadeChoice,
      isPreferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
      allows: (category) => preferences[category],
    }),
    [
      preferences,
      hasUserMadeChoice,
      isPreferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within <CookieConsentProvider>");
  }
  return context;
}
