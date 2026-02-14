import "./BenefitsBentoGrid.scss";
import benefits1 from "../assets/homepage/benefits1.png";
import benefits2 from "../assets/homepage/benefits2.png";
import benefits3 from "../assets/homepage/benefits3.png";
import benefits4 from "../assets/homepage/benefits4.png";
import benefits5 from "../assets/homepage/benefits5.png";

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
