import "./BenefitsBentoGrid.scss";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";
// import benefits1 from "../assets/homepage/benefits1.png";
// import benefits2 from "../assets/homepage/benefits2.png";
// import benefits3 from "../assets/homepage/benefits3.png";
// import benefits4 from "../assets/homepage/benefits4.png";
// import benefits5 from "../assets/homepage/benefits5.png";

type BentoCard = {
  id: string;
  imageUrl: string;
  alt: string;
};

const benefits1 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965680/benefits1_xfitlx.png";
const benefits2 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965679/benefits2_qzmvy3.png";
const benefits3 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965679/benefits3_uaisg2.png";
const benefits4 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965680/benefits4_nvhiz9.png";
const benefits5 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965680/benefits52_japnae.png";

const cards: BentoCard[] = [
  {
    id: "clinical-results",
    imageUrl: benefits1,
    alt: "Receive clinical-grade results in 6 days of testing",
  },
  {
    id: "egg-count",
    imageUrl: benefits2,
    alt: "Get insights into your egg count",
  },
  {
    id: "hormonal-symptoms",
    imageUrl: benefits3,
    alt: "Find answers to your hormonal symptoms such as acne or irregular periods",
  },
  {
    id: "care-plan",
    imageUrl: benefits4,
    alt: "Receive a doctor-written report with a clinical Care Plan",
  },
  {
    id: "expert-support",
    imageUrl: benefits5,
    alt: "Expert support included with a Clinical Result Review Call",
  },
];

export function BenefitsBentoGrid() {
  return (
    <section className="benefitsBentoGrid">
      <h2 className="benefitsBentoGrid__heading">
        Women's wellness cannot be reduced to trending protocols
      </h2>

      <div className="benefitsBentoGrid__inner">
        {/* Top row — 3 cards */}
        <div className="benefitsBentoGrid__row benefitsBentoGrid__row--top">
          {cards.slice(0, 3).map((card) => (
            <div
              key={card.id}
              className={`benefitsBentoGrid__card benefitsBentoGrid__card--${card.id}`}
            >
              <img
                className="benefitsBentoGrid__cardImg"
                src={optimizeCloudinaryImageUrl(card.imageUrl, {
                  width: 700,
                })}
                srcSet={buildCloudinarySrcSet(card.imageUrl, [320, 480, 640, 800])}
                sizes="(max-width: 720px) 100vw, 33vw"
                alt={card.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div className="benefitsBentoGrid__row benefitsBentoGrid__row--bottom">
          {cards.slice(3).map((card) => (
            <div
              key={card.id}
              className={`benefitsBentoGrid__card benefitsBentoGrid__card--${card.id}`}
            >
              <img
                className="benefitsBentoGrid__cardImg"
                src={optimizeCloudinaryImageUrl(card.imageUrl, {
                  width: 900,
                })}
                srcSet={buildCloudinarySrcSet(card.imageUrl, [400, 640, 800, 1000])}
                sizes="(max-width: 720px) 100vw, 50vw"
                alt={card.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
