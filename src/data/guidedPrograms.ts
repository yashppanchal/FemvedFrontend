export type GuidedProgramCard = {
  programId?: string;
  programName: string;
  expertName: string;
  body: string;
  imageUrl?: string;
  programPageDisplayDetails?: {
    overview?: string;
    whatYouGet?: string[];
    whoIsThisFor?: string[];
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
        programId?: string;
        programName?: string;
        programGridDescription?: string;
        programGridImage?: string;
        expertId?: string;
        expertName?: string;
        programPageDisplayDetails?: {
          overview?: string;
          whatYouGet?: string[];
          whoIsThisFor?: string[];
        };
      }>;
    }>;
  }>;
};

let guidedProgramsCache: GuidedProgramInfo[] | null = null;
let guidedProgramsRequest: Promise<GuidedProgramInfo[]> | null = null;

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
  const categoryName = category.categoryName ?? "";

  return {
    categoryId: category.categoryId,
    slug: categoryName,
    programType: page.categoryType ?? "",
    heroTitle: page.categoryHeroTitle ?? "",
    heroSubtext: page.categoryHeroSubtext ?? "",
    ctaLabel: page.categoryCtaLabel ?? "",
    ctaTo: page.categoryCtaTo ?? "",
    imageSlug: page.categoryPageDataImage ?? "",
    whatsIncluded: page.whatsIncludedInCategory ?? [],
    keyAreas: page.categoryPageKeyAreas ?? [],
    programsInCategory: (category.programsInCategory ?? []).map((program) => ({
      programId: program.programId ?? "",
      programName: program.programName ?? "",
      expertName: program.expertName ?? "",
      body: program.programGridDescription ?? "",
      imageUrl: program.programGridImage ?? "",
      programPageDisplayDetails: {
        overview: program.programPageDisplayDetails?.overview ?? "",
        whatYouGet: program.programPageDisplayDetails?.whatYouGet ?? [],
        whoIsThisFor: program.programPageDisplayDetails?.whoIsThisFor ?? [],
      },
    })),
  };
}

export async function loadGuidedPrograms(): Promise<GuidedProgramInfo[]> {
  if (guidedProgramsCache) {
    return guidedProgramsCache;
  }

  if (guidedProgramsRequest) {
    return guidedProgramsRequest;
  }

  guidedProgramsRequest = (async () => {
    const response = await fetch("https://api.femved.com/api/v1/guided/tree");
    if (!response.ok) {
      throw new Error(`Failed guided tree request: ${response.status}`);
    }

    const payload = (await response.json()) as GuidedTreeResponse;
    const guidedDomain =
      payload.domains?.find((domain) => domain.domainName === "Guided 1:1 Care") ??
      null;
    const mappedPrograms = (guidedDomain?.categories ?? []).map(mapApiCategoryToProgram);

    guidedProgramsCache = mappedPrograms;
    return mappedPrograms;
  })();

  try {
    return await guidedProgramsRequest;
  } finally {
    guidedProgramsRequest = null;
  }
}
