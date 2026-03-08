import type { CountryCode } from "../country/useCountry";

export type GuidedProgramCard = {
  programDurations?: Array<{
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

const guidedProgramsCache = new Map<CountryCode, GuidedProgramInfo[]>();
const guidedProgramsRequests = new Map<CountryCode, Promise<GuidedProgramInfo[]>>();

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

export async function loadGuidedPrograms(
  countryCode: CountryCode = "IN",
): Promise<GuidedProgramInfo[]> {
  const cachedPrograms = guidedProgramsCache.get(countryCode);
  if (cachedPrograms) {
    return cachedPrograms;
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

    guidedProgramsCache.set(countryCode, mappedPrograms);
    return mappedPrograms;
  })();
  guidedProgramsRequests.set(countryCode, request);

  try {
    return await request;
  } finally {
    guidedProgramsRequests.delete(countryCode);
  }
}
