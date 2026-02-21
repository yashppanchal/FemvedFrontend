import "./GuidedProgramDetail.scss";
import { Link, useParams } from "react-router-dom";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { HeroSection } from "../components/guided-care-components/HeroSection";
import { MoreSection } from "../components/guided-care-components/MoreSection";
import { ChooseSection } from "../components/guided-care-components/ChooseSection";
import { CtaBanner } from "../components/guided-care-components/CtaBanner";
import { ZigzagSection } from "../components/guided-care-components/ZigzagSection";
import dataJson from "../data/data.json";

type GuidedProgramInfo = {
  slug?: string;
  programType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel?: string;
  ctaTo?: string;
  whatsIncluded?: string[];
  keyAreas?: string[];
  imageSlug?: string;
};

type DataJsonShape = {
  data: Array<{
    name: string;
    info: GuidedProgramInfo[];
  }>;
};

function getGuidedProgramBySlug(programSlug: string | undefined) {
  if (!programSlug) return null;

  const root = dataJson as unknown as DataJsonShape;
  const guided = root.data.find((d) => d.name === "Guided 1:1 Care");
  if (!guided) return null;

  return guided.info.find((p) => p.slug === programSlug) ?? null;
}

export default function GuidedProgramDetail() {
  const { programSlug } = useParams<{ programSlug: string }>();
  const program = getGuidedProgramBySlug(programSlug);

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

      <ChooseSection keyAreas={keyAreas} />

      <CtaBanner />

      <ZigzagSection />

      <TestimonialsCarousel />
    </section>
  );
}
