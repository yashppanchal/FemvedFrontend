import "./GuidedProgramDetail.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { HeroSection } from "../components/guided-care-components/HeroSection";
import { MoreSection } from "../components/guided-care-components/MoreSection";
import {
  ChooseSection,
  type ProgramCard,
} from "../components/guided-care-components/ChooseSection";
import { CtaBanner } from "../components/guided-care-components/CtaBanner";
import { ZigzagSection } from "../components/guided-care-components/ZigzagSection";

type GuidedProgramInfo = {
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
  programsInCategory?: ProgramCard[];
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
      }>;
    }>;
  }>;
};

let guidedProgramsCache: GuidedProgramInfo[] | null = null;
let guidedProgramsRequest: Promise<GuidedProgramInfo[]> | null = null;

function normalizeSlug(value: string | undefined) {
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
      programName: program.programName ?? "",
      expertName: program.expertName ?? "",
      body: program.programGridDescription ?? "",
      imageUrl: program.programGridImage ?? "",
    })),
  };
}

async function loadGuidedPrograms(): Promise<GuidedProgramInfo[]> {
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

export default function GuidedProgramDetail() {
  const { programSlug } = useParams<{ programSlug: string }>();
  const [programs, setPrograms] = useState<GuidedProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadGuidedTree() {
      setLoading(true);
      setHasError(false);

      try {
        const mappedPrograms = await loadGuidedPrograms();

        if (isActive) {
          setPrograms(mappedPrograms);
        }
      } catch {
        if (isActive) {
          setHasError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadGuidedTree();

    return () => {
      isActive = false;
    };
  }, []);

  const program = useMemo(() => {
    if (!programSlug) return null;
    const desiredSlug = normalizeSlug(programSlug);

    return (
      programs.find((item) => {
        const mappedSlug = normalizeSlug(item.slug);
        return item.slug === programSlug || mappedSlug === desiredSlug;
      }) ?? null
    );
  }, [programSlug, programs]);

  if (loading) {
    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">Loading guided program...</h1>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">Unable to load guided programs</h1>
        <p className="page__lead">
          Please refresh the page and try again. If this continues, go back{" "}
          <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  if (!program) {
    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">Guided program not found</h1>
        <p className="page__lead">
          This guided program doesn't exist yet. Go back{" "}
          <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  const whatsIncluded = program.whatsIncluded ?? [];
  const keyAreas = program.keyAreas ?? [];
  const programsInCategory = program.programsInCategory ?? [];

  return (
    <section className="page guidedProgramDetail">
      <HeroSection
        heroTitle={program.heroTitle}
        heroSubtext={program.heroSubtext}
        imageSlug={program.imageSlug}
        ctaLabel={program.ctaLabel}
        ctaTo={program.ctaTo}
      />
      <MoreSection whatsIncluded={whatsIncluded} />

      <ChooseSection keyAreas={keyAreas} programs={programsInCategory} />

      <CtaBanner />

      <ZigzagSection />

      <TestimonialsCarousel />
    </section>
  );
}
