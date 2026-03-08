import "./GuidedProgramDetail.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { HeroSection } from "../components/guided-care-components/HeroSection";
import { MoreSection } from "../components/guided-care-components/MoreSection";
import { ChooseSection } from "../components/guided-care-components/ChooseSection";
import { CtaBanner } from "../components/guided-care-components/CtaBanner";
import { ZigzagSection } from "../components/guided-care-components/ZigzagSection";
import { useCountry } from "../country/useCountry";
import {
  loadGuidedPrograms,
  normalizeSlug,
  type GuidedProgramInfo,
} from "../data/guidedPrograms";

export default function GuidedProgramDetail() {
  const { country, isCountryReady } = useCountry();
  const { programSlug, programId } = useParams<{
    programSlug: string;
    programId?: string;
  }>();
  const [programs, setPrograms] = useState<GuidedProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isCountryReady) return;

    let isActive = true;

    async function loadGuidedTree() {
      setLoading(true);
      setHasError(false);

      try {
        const mappedPrograms = await loadGuidedPrograms(country);

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
  }, [country, isCountryReady]);

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

  const selectedProgram = useMemo(() => {
    if (!programId) return null;

    for (const category of programs) {
      const matchedProgram = (category.programsInCategory ?? []).find(
        (item) => item.programId === programId,
      );

      if (matchedProgram) {
        return matchedProgram;
      }
    }

    return null;
  }, [programId, programs]);

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

  if (programId) {
    if (!selectedProgram) {
      return (
        <section className="page guidedProgramDetail">
          <h1 className="page__title">Program not found</h1>
          <p className="page__lead">
            This program doesn't exist yet. Go back <Link to="/">home</Link>.
          </p>
        </section>
      );
    }

    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">{selectedProgram.programName}</h1>
      </section>
    );
  }

  const whatsIncluded = program.whatsIncluded ?? [];
  const keyAreas = program.keyAreas ?? [];
  const programsInCategory = program.programsInCategory ?? [];
  const categorySlugForLinks = programSlug ?? normalizeSlug(program.slug);

  return (
    <section className="page guidedProgramDetail">
      <HeroSection
        heroTitle={program.heroTitle}
        heroSubtext={program.heroSubtext}
        imageSlug={program.imageSlug}
        ctaLabel={program.ctaLabel}
      />
      <MoreSection whatsIncluded={whatsIncluded} />

      <ChooseSection
        keyAreas={keyAreas}
        programs={programsInCategory}
        programSlug={categorySlugForLinks}
      />

      <CtaBanner />

      <ZigzagSection />

      <TestimonialsCarousel />
    </section>
  );
}
