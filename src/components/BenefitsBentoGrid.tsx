import "./BenefitsBentoGrid.scss";
import benefits1 from "../assets/homepage/benefits1.png";
import benefits2 from "../assets/homepage/benefits2.png";

// Card images will be provided later — using placeholders for now
const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23e8e0da' width='600' height='400'/%3E%3C/svg%3E";

type BentoCard = {
  id: string;
  imageUrl: string;
  alt: string;
};

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
    imageUrl: placeholderImg,
    alt: "Find answers to your hormonal symptoms such as acne or irregular periods",
  },
  {
    id: "care-plan",
    imageUrl: placeholderImg,
    alt: "Receive a doctor-written report with a clinical Care Plan",
  },
  {
    id: "expert-support",
    imageUrl: placeholderImg,
    alt: "Expert support included with a Clinical Result Review Call",
  },
];

export function BenefitsBentoGrid() {
  return (
    <section className="benefitsBentoGrid">
      <div className="benefitsBentoGrid__inner">
        {/* Top row — 3 cards */}
        <div className="benefitsBentoGrid__row benefitsBentoGrid__row--top">
          {cards.slice(0, 3).map((card) => (
            <div key={card.id} className={`benefitsBentoGrid__card benefitsBentoGrid__card--${card.id}`}>
              <img
                className="benefitsBentoGrid__cardImg"
                src={card.imageUrl}
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
            <div key={card.id} className={`benefitsBentoGrid__card benefitsBentoGrid__card--${card.id}`}>
              <img
                className="benefitsBentoGrid__cardImg"
                src={card.imageUrl}
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
