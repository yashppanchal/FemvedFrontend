import { PrimaryButton } from "../PrimaryButton";
import heroImage from "../../assets/hero-slide-2.svg";
import hormonal from "../../assets/guided-care-hero/hormonal.jpg";
import longevity from "../../assets/guided-care-hero/longevity.jpg";
import fitness from "../../assets/guided-care-hero/fitness.jpg";
import mind from "../../assets/guided-care-hero/mind.jpg";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../../cloudinary/image";

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
  const normalizedImage = imageSlug?.trim() ?? "";
  const resolvedHeroImage =
    (normalizedImage && GUIDED_CARE_HERO_IMAGES[normalizedImage]) ||
    normalizedImage ||
    heroImage;
  const optimizedHeroImage = optimizeCloudinaryImageUrl(resolvedHeroImage, {
    width: 1200,
    quality: "auto:eco",
    crop: "fill",
  });
  const heroSrcSet = buildCloudinarySrcSet(
    resolvedHeroImage,
    [480, 720, 960, 1200],
    { quality: "auto:eco", crop: "fill" },
  );

  return (
    <div className="guidedProgramDetail__hero">
      <div className="guidedProgramDetail__heroMedia">
        <img
          className="guidedProgramDetail__heroImage"
          src={optimizedHeroImage}
          srcSet={heroSrcSet}
          sizes="(max-width: 860px) 100vw, 48vw"
          alt={heroTitle}
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
