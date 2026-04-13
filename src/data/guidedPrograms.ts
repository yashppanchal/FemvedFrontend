import type { CountryCode } from "../country/useCountry";
import { BASE_URL } from "../api/client";

export type GuidedProgramCard = {
  programDurations?: Array<{
    durationId: string;
    durationLabel: string;
    durationPrice: string;
  }>;
  programId?: string;
  programSlug?: string;
  programName: string;
  expertName: string;
  expertTitle?: string;
  expertDescription?: string;
  expertDetailedDescription?: string;
  expertGridImageUrl?: string;
  expertImageUrl?: string;
  body: string;
  imageUrl?: string;
  programPageDisplayDetails?: {
    overview?: string;
    whatYouGet?: string[];
    whoIsThisFor?: string[];
    detailSections?: Array<{
      heading?: string;
      description?: string;
    }>;
  };
};

export type GuidedProgramInfo = {
  categoryId?: string;
  slug?: string;
  programType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel?: string;
  ctaTo?: string;
  whatsIncluded?: string[];
  keyAreas?: string[];
  imageSlug?: string;
  programsInCategory?: GuidedProgramCard[];
};

type GuidedTreeResponse = {
  domains?: Array<{
    domainId?: string;
    domainName?: string;
    categories?: Array<{
      categoryId?: string;
      categoryName?: string;
      categoryPageData?: {
        categoryPageDataImage?: string;
        imageUrl?: string;
        image_url?: string;
        categoryType?: string;
        categoryHeroTitle?: string;
        categoryHeroSubtext?: string;
        categoryCtaLabel?: string;
        categoryCtaTo?: string;
        whatsIncludedInCategory?: string[];
        categoryPageHeader?: string;
        categoryPageKeyAreas?: string[];
      };
      programsInCategory?: Array<{
        programDurations?: Array<{
          durationId?: string;
          durationLabel?: string;
          durationPrice?: string;
        }>;
        programId?: string;
        programSlug?: string;
        programName?: string;
        programGridDescription?: string;
        programGridImage?: string;
        gridImageUrl?: string;
        grid_image_url?: string;
        imageUrl?: string;
        image_url?: string;
        expertId?: string;
        expertName?: string;
        expertTitle?: string;
        expertDescription?: string;
        expertGridImageUrl?: string;
        expert_grid_image_url?: string;
        expertImage?: string;
        expertImageUrl?: string;
        expertDetails?: {
          expertTitle?: string;
          expertDescription?: string;
          expertDetailedDescription?: string;
          expertGridImageUrl?: string;
          expert_grid_image_url?: string;
          expertImage?: string;
          expertImageUrl?: string;
        };
        expertDetailedDescription?: string;
        programPageDisplayDetails?: {
          overview?: string;
          whatYouGet?: string[];
          whoIsThisFor?: string[];
          detailSections?: Array<{
            heading?: string;
            description?: string;
          }>;
        };
      }>;
    }>;
  }>;
};

type GuidedProgramsCacheEntry = {
  timestamp: number;
  version: number;
  data: GuidedProgramInfo[];
};

type PersistedGuidedPrograms = {
  timestamp: number;
  version: number;
  data: GuidedProgramInfo[];
};

// ── Module-level caches ──────────────────────────────────────────────────────

const guidedProgramsCache = new Map<CountryCode, GuidedProgramsCacheEntry>();
// In-flight fetch promises — deduplicated per country
const guidedProgramsRequests = new Map<CountryCode, Promise<GuidedProgramInfo[]>>();
// Countries currently being refreshed in background (stale-while-revalidate)
const guidedProgramsRefreshing = new Set<CountryCode>();

const GUIDED_PROGRAMS_STORAGE_PREFIX = "femved.guidedPrograms.";
const GUIDED_PROGRAMS_VERSION_STORAGE_KEY = "femved.guidedPrograms.version";
const GUIDED_PROGRAMS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function normalizeSlug(value: string | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function mapApiCategoryToProgram(
  category: NonNullable<
    NonNullable<
      NonNullable<GuidedTreeResponse["domains"]>[number]["categories"]
    >[number]
  >,
): GuidedProgramInfo {
  const page = category.categoryPageData ?? {};
  const categoryImage =
    page.categoryPageDataImage ?? page.imageUrl ?? page.image_url ?? "";
  const categoryName = category.categoryName ?? "";

  return {
    categoryId: category.categoryId,
    slug: categoryName,
    programType: page.categoryType ?? "",
    heroTitle: page.categoryHeroTitle ?? "",
    heroSubtext: page.categoryHeroSubtext ?? "",
    ctaLabel: page.categoryCtaLabel ?? "",
    ctaTo: page.categoryCtaTo ?? "",
    imageSlug: categoryImage,
    whatsIncluded: page.whatsIncludedInCategory ?? [],
    keyAreas: page.categoryPageKeyAreas ?? [],
    programsInCategory: (category.programsInCategory ?? []).map((program) => {
      const expertDetails = program.expertDetails ?? {};
      const programGridImage =
        program.programGridImage ??
        program.gridImageUrl ??
        program.grid_image_url ??
        program.imageUrl ??
        program.image_url ??
        "";

      return {
        programDurations: (program.programDurations ?? []).map((duration) => ({
          durationId: duration.durationId ?? "",
          durationLabel: duration.durationLabel ?? "",
          durationPrice: duration.durationPrice ?? "",
        })),
        programId: program.programId ?? "",
        programSlug: program.programSlug ?? "",
        programName: program.programName ?? "",
        expertName: program.expertName ?? "",
        expertTitle: program.expertTitle ?? expertDetails.expertTitle ?? "",
        expertDescription:
          program.expertDescription ?? expertDetails.expertDescription ?? "",
        expertDetailedDescription:
          program.expertDetailedDescription ??
          expertDetails.expertDetailedDescription ??
          program.expertDescription ??
          expertDetails.expertDescription ??
          "",
        expertGridImageUrl:
          program.expertGridImageUrl ??
          program.expert_grid_image_url ??
          expertDetails.expertGridImageUrl ??
          expertDetails.expert_grid_image_url ??
          program.expertImageUrl ??
          program.expertImage ??
          expertDetails.expertImageUrl ??
          expertDetails.expertImage ??
          "",
        expertImageUrl:
          program.expertImageUrl ??
          program.expertImage ??
          expertDetails.expertImageUrl ??
          expertDetails.expertImage ??
          "",
        body: program.programGridDescription ?? "",
        imageUrl: programGridImage,
        programPageDisplayDetails: {
          overview: program.programPageDisplayDetails?.overview ?? "",
          whatYouGet: program.programPageDisplayDetails?.whatYouGet ?? [],
          whoIsThisFor: program.programPageDisplayDetails?.whoIsThisFor ?? [],
          detailSections:
            program.programPageDisplayDetails?.detailSections?.map((section) => ({
              heading: section.heading ?? "",
              description: section.description ?? "",
            })) ?? [],
        },
      };
    }),
  };
}

function getGuidedProgramsStorageKey(countryCode: CountryCode): string {
  return `${GUIDED_PROGRAMS_STORAGE_PREFIX}${countryCode}`;
}

function getGuidedProgramsVersion(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(GUIDED_PROGRAMS_VERSION_STORAGE_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Reads persisted programs from localStorage.
 * @param checkTtl — if true, returns null when data is older than TTL.
 *                   if false, returns stale data regardless of age (for SWR).
 */
function readPersisted(
  countryCode: CountryCode,
  version: number,
  checkTtl: boolean,
): GuidedProgramInfo[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getGuidedProgramsStorageKey(countryCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedGuidedPrograms;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.timestamp !== "number" ||
      typeof parsed.version !== "number" ||
      !Array.isArray(parsed.data)
    ) return null;
    if (parsed.version !== version) return null;
    if (checkTtl && Date.now() - parsed.timestamp > GUIDED_PROGRAMS_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function persistGuidedPrograms(
  countryCode: CountryCode,
  version: number,
  data: GuidedProgramInfo[],
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedGuidedPrograms = { timestamp: Date.now(), version, data };
    window.localStorage.setItem(
      getGuidedProgramsStorageKey(countryCode),
      JSON.stringify(payload),
    );
  } catch {
    // localStorage write failure should not block rendering
  }
}

/** Performs the actual network fetch, deduplicating concurrent requests. */
async function doFetch(countryCode: CountryCode, version: number): Promise<GuidedProgramInfo[]> {
  const active = guidedProgramsRequests.get(countryCode);
  if (active) return active;

  const request = (async () => {
    // Backend uses ISO 3166-1 alpha-2 ("GB") while the frontend uses "UK" internally
    const apiCountryCode = countryCode === "UK" ? "GB" : countryCode;
    const query = new URLSearchParams({ countryCode: apiCountryCode });
    const response = await fetch(
      `${BASE_URL}/guided/tree?${query.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed guided tree request: ${response.status}`);
    }
    const payload = (await response.json()) as GuidedTreeResponse;
    const guidedDomain =
      payload.domains?.find((d) => d.domainName === "Guided 1:1 Care") ?? null;
    const mapped = (guidedDomain?.categories ?? []).map(mapApiCategoryToProgram);

    guidedProgramsCache.set(countryCode, { timestamp: Date.now(), version, data: mapped });
    persistGuidedPrograms(countryCode, version, mapped);
    return mapped;
  })();

  guidedProgramsRequests.set(countryCode, request);
  try {
    return await request;
  } finally {
    guidedProgramsRequests.delete(countryCode);
  }
}

/** Kicks off a background refresh without blocking the caller. */
function scheduleBackgroundRefresh(countryCode: CountryCode, version: number): void {
  if (guidedProgramsRefreshing.has(countryCode)) return;
  if (guidedProgramsRequests.has(countryCode)) return;
  guidedProgramsRefreshing.add(countryCode);
  doFetch(countryCode, version)
    .catch(() => {})
    .finally(() => guidedProgramsRefreshing.delete(countryCode));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Synchronously returns any cached data for the given country (in-memory or localStorage),
 * ignoring TTL expiry. Returns null only when there is truly no data at all.
 * Use this to initialize component state before the async load completes.
 */
export function getGuidedProgramsSnapshot(
  countryCode: CountryCode,
): GuidedProgramInfo[] | null {
  // In-memory cache (fastest, ignore TTL)
  const entry = guidedProgramsCache.get(countryCode);
  if (entry) return entry.data;
  // localStorage fallback (ignore TTL — stale is fine for instant render)
  const version = getGuidedProgramsVersion();
  return readPersisted(countryCode, version, false);
}

/**
 * Loads guided programs with stale-while-revalidate semantics:
 * - Fresh cache  → returns immediately, no network call.
 * - Stale cache  → returns stale data immediately + refreshes in background.
 * - No cache     → fetches from network (shows loading state).
 */
export async function loadGuidedPrograms(
  countryCode: CountryCode = "US",
): Promise<GuidedProgramInfo[]> {
  const version = getGuidedProgramsVersion();

  // 1. Fresh in-memory cache
  const entry = guidedProgramsCache.get(countryCode);
  if (entry && entry.version === version) {
    if (Date.now() - entry.timestamp <= GUIDED_PROGRAMS_CACHE_TTL_MS) {
      return entry.data;
    }
    // Stale in-memory cache → serve immediately + background refresh
    scheduleBackgroundRefresh(countryCode, version);
    return entry.data;
  }

  // 2. Fresh localStorage
  const fresh = readPersisted(countryCode, version, true);
  if (fresh) {
    guidedProgramsCache.set(countryCode, { timestamp: Date.now(), version, data: fresh });
    return fresh;
  }

  // 3. Stale localStorage → serve immediately + background refresh
  const stale = readPersisted(countryCode, version, false);
  if (stale) {
    // Warm in-memory cache so next call (if this refresh is fast) gets it
    guidedProgramsCache.set(countryCode, { timestamp: 0, version, data: stale });
    scheduleBackgroundRefresh(countryCode, version);
    return stale;
  }

  // 4. No data anywhere — must wait for network
  return doFetch(countryCode, version);
}

/**
 * Fire-and-forget preload. Call this as early as possible (e.g. from a hover handler
 * or when the country becomes known) to warm the cache before the user navigates.
 */
export function preloadGuidedPrograms(countryCode: CountryCode): void {
  loadGuidedPrograms(countryCode).catch(() => {});
}

export function bumpGuidedProgramsCacheVersion(): void {
  if (typeof window === "undefined") return;
  const current = getGuidedProgramsVersion();
  window.localStorage.setItem(GUIDED_PROGRAMS_VERSION_STORAGE_KEY, String(current + 1));
  guidedProgramsCache.clear();
}
