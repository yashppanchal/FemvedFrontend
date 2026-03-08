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
import { CHOOSE_SECTION_ID } from "./ChooseSection";

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
};

export function HeroSection({
  heroTitle,
  heroSubtext,
  imageSlug,
  ctaLabel,
}: HeroSectionProps) {
  const handleCtaClick = () => {
    const chooseSection = document.getElementById(CHOOSE_SECTION_ID);
    if (!chooseSection) return;

    const header = document.querySelector(".layout__header");
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const targetTop =
      chooseSection.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  };

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

        {ctaLabel ? (
          <div className="guidedProgramDetail__ctaRow">
            <PrimaryButton label={ctaLabel} onClick={handleCtaClick} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
