import type { CountryCode } from "../country/useCountry";

export type GuidedProgramCard = {
  programDurations?: Array<{
    durationId: string;
    durationLabel: string;
    durationPrice: string;
  }>;
  programId?: string;
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

const guidedProgramsCache = new Map<CountryCode, GuidedProgramsCacheEntry>();
const guidedProgramsRequests = new Map<CountryCode, Promise<GuidedProgramInfo[]>>();
const GUIDED_PROGRAMS_STORAGE_PREFIX = "femved.guidedPrograms.";
const GUIDED_PROGRAMS_VERSION_STORAGE_KEY = "femved.guidedPrograms.version";
const GUIDED_PROGRAMS_CACHE_TTL_MS = 5 * 60 * 1000;

type PersistedGuidedPrograms = {
  timestamp: number;
  version: number;
  data: GuidedProgramInfo[];
};

export function normalizeSlug(value: string | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

function readPersistedGuidedPrograms(
  countryCode: CountryCode,
  version: number,
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
    ) {
      return null;
    }

    if (parsed.version !== version) {
      return null;
    }

    if (Date.now() - parsed.timestamp > GUIDED_PROGRAMS_CACHE_TTL_MS) {
      return null;
    }

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
    const payload: PersistedGuidedPrograms = {
      timestamp: Date.now(),
      version,
      data,
    };
    window.localStorage.setItem(
      getGuidedProgramsStorageKey(countryCode),
      JSON.stringify(payload),
    );
  } catch {
    // localStorage write failure should not block rendering
  }
}

export async function loadGuidedPrograms(
  countryCode: CountryCode = "US",
): Promise<GuidedProgramInfo[]> {
  const currentVersion = getGuidedProgramsVersion();
  const cachedEntry = guidedProgramsCache.get(countryCode);
  if (
    cachedEntry &&
    cachedEntry.version === currentVersion &&
    Date.now() - cachedEntry.timestamp <= GUIDED_PROGRAMS_CACHE_TTL_MS
  ) {
    return cachedEntry.data;
  }

  const persistedPrograms = readPersistedGuidedPrograms(countryCode, currentVersion);
  if (persistedPrograms) {
    guidedProgramsCache.set(countryCode, {
      timestamp: Date.now(),
      version: currentVersion,
      data: persistedPrograms,
    });
    return persistedPrograms;
  }

  const activeRequest = guidedProgramsRequests.get(countryCode);
  if (activeRequest) {
    return activeRequest;
  }

  const request = (async () => {
    const query = new URLSearchParams({ countryCode });
    const response = await fetch(
      `https://api.femved.com/api/v1/guided/tree?${query.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed guided tree request: ${response.status}`);
    }

    const payload = (await response.json()) as GuidedTreeResponse;
    const guidedDomain =
      payload.domains?.find((domain) => domain.domainName === "Guided 1:1 Care") ??
      null;
    const mappedPrograms = (guidedDomain?.categories ?? []).map(mapApiCategoryToProgram);

    guidedProgramsCache.set(countryCode, {
      timestamp: Date.now(),
      version: currentVersion,
      data: mappedPrograms,
    });
    persistGuidedPrograms(countryCode, currentVersion, mappedPrograms);
    return mappedPrograms;
  })();
  guidedProgramsRequests.set(countryCode, request);

  try {
    return await request;
  } finally {
    guidedProgramsRequests.delete(countryCode);
  }
}
