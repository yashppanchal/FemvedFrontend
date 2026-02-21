import { PrimaryButton } from "../PrimaryButton";
import heroImage from "../../assets/hero-slide-2.svg";
import hormonal from "../../assets/guided-care-hero/hormonal.jpg";
import longevity from "../../assets/guided-care-hero/longevity.jpg";
import fitness from "../../assets/guided-care-hero/fitness.jpg";
import mind from "../../assets/guided-care-hero/mind.jpg";

const GUIDED_CARE_HERO_IMAGES: Record<string, string> = {
  hormonal,
  mind,
  longevity,
  fitness,
};

type HeroSectionProps = {
  heroTitle: string;
  heroSubtext: string;
  imageSlug?: string;
  ctaLabel?: string;
  ctaTo?: string;
};

export function HeroSection({
  heroTitle,
  heroSubtext,
  imageSlug,
  ctaLabel,
  ctaTo,
}: HeroSectionProps) {
  return (
    <div className="guidedProgramDetail__hero">
      <div className="guidedProgramDetail__heroMedia">
        <img
          className="guidedProgramDetail__heroImage"
          src={
            imageSlug && GUIDED_CARE_HERO_IMAGES[imageSlug]
              ? GUIDED_CARE_HERO_IMAGES[imageSlug]
              : heroImage
          }
          alt={heroTitle}
        />
      </div>

      <div className="guidedProgramDetail__heroContent">
        <h1 className="page__title guidedProgramDetail__title">{heroTitle}</h1>
        <p className="page__lead guidedProgramDetail__subtext">{heroSubtext}</p>

        {ctaLabel && ctaTo ? (
          <div className="guidedProgramDetail__ctaRow">
            <PrimaryButton label={ctaLabel} to={ctaTo} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
