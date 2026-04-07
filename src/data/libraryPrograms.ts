import type { CountryCode } from "../country/useCountry";
import { fetchLibraryTree, type LibraryTreeResponse } from "../api/library";

// ── Cache types ──────────────────────────────────────────────────────────────

type LibraryCacheEntry = {
  timestamp: number;
  version: number;
  data: LibraryTreeResponse;
};

type PersistedLibraryData = {
  timestamp: number;
  version: number;
  data: LibraryTreeResponse;
};

// ── Module-level caches ──────────────────────────────────────────────────────

const libraryCache = new Map<CountryCode, LibraryCacheEntry>();
const libraryRequests = new Map<CountryCode, Promise<LibraryTreeResponse>>();
const libraryRefreshing = new Set<CountryCode>();

const LIBRARY_STORAGE_PREFIX = "femved.library.";
const LIBRARY_VERSION_STORAGE_KEY = "femved.library.version";
const LIBRARY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Internal helpers ─────────────────────────────────────────────────────────

function getLibraryVersion(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LIBRARY_VERSION_STORAGE_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStorageKey(countryCode: CountryCode): string {
  return `${LIBRARY_STORAGE_PREFIX}${countryCode}`;
}

function readPersisted(
  countryCode: CountryCode,
  version: number,
  checkTtl: boolean,
): LibraryTreeResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(countryCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedLibraryData;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.timestamp !== "number" ||
      typeof parsed.version !== "number" ||
      !parsed.data
    ) return null;
    if (parsed.version !== version) return null;
    if (checkTtl && Date.now() - parsed.timestamp > LIBRARY_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function persistLibraryData(
  countryCode: CountryCode,
  version: number,
  data: LibraryTreeResponse,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedLibraryData = { timestamp: Date.now(), version, data };
    window.localStorage.setItem(getStorageKey(countryCode), JSON.stringify(payload));
  } catch {
    // localStorage write failure should not block rendering
  }
}

async function doFetch(countryCode: CountryCode, version: number): Promise<LibraryTreeResponse> {
  const active = libraryRequests.get(countryCode);
  if (active) return active;

  const request = (async () => {
    const apiCountryCode = countryCode === "UK" ? "GB" : countryCode;
    const data = await fetchLibraryTree(apiCountryCode);

    libraryCache.set(countryCode, { timestamp: Date.now(), version, data });
    persistLibraryData(countryCode, version, data);
    return data;
  })();

  libraryRequests.set(countryCode, request);
  try {
    return await request;
  } finally {
    libraryRequests.delete(countryCode);
  }
}

function scheduleBackgroundRefresh(countryCode: CountryCode, version: number): void {
  if (libraryRefreshing.has(countryCode)) return;
  if (libraryRequests.has(countryCode)) return;
  libraryRefreshing.add(countryCode);
  doFetch(countryCode, version)
    .catch(() => {})
    .finally(() => libraryRefreshing.delete(countryCode));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Synchronously returns any cached library tree data (in-memory or localStorage),
 * ignoring TTL. Returns null when there is no data at all.
 */
export function getLibrarySnapshot(
  countryCode: CountryCode,
): LibraryTreeResponse | null {
  const entry = libraryCache.get(countryCode);
  if (entry) return entry.data;
  const version = getLibraryVersion();
  return readPersisted(countryCode, version, false);
}

/**
 * Loads library tree with stale-while-revalidate semantics:
 * - Fresh cache  → returns immediately, no network call.
 * - Stale cache  → returns stale data immediately + refreshes in background.
 * - No cache     → fetches from network.
 */
export async function loadLibraryTree(
  countryCode: CountryCode = "US",
): Promise<LibraryTreeResponse> {
  const version = getLibraryVersion();

  // 1. Fresh in-memory cache
  const entry = libraryCache.get(countryCode);
  if (entry && entry.version === version) {
    if (Date.now() - entry.timestamp <= LIBRARY_CACHE_TTL_MS) {
      return entry.data;
    }
    scheduleBackgroundRefresh(countryCode, version);
    return entry.data;
  }

  // 2. Fresh localStorage
  const fresh = readPersisted(countryCode, version, true);
  if (fresh) {
    libraryCache.set(countryCode, { timestamp: Date.now(), version, data: fresh });
    return fresh;
  }

  // 3. Stale localStorage
  const stale = readPersisted(countryCode, version, false);
  if (stale) {
    libraryCache.set(countryCode, { timestamp: 0, version, data: stale });
    scheduleBackgroundRefresh(countryCode, version);
    return stale;
  }

  // 4. No data — fetch from network
  return doFetch(countryCode, version);
}

/** Fire-and-forget preload to warm the cache early. */
export function preloadLibraryTree(countryCode: CountryCode): void {
  loadLibraryTree(countryCode).catch(() => {});
}

/** Bumps cache version so next load forces a fresh fetch. */
export function bumpLibraryCacheVersion(): void {
  if (typeof window === "undefined") return;
  const current = getLibraryVersion();
  window.localStorage.setItem(LIBRARY_VERSION_STORAGE_KEY, String(current + 1));
  libraryCache.clear();
}
