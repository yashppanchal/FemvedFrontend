import "./BentoGrid.scss";

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
    imageUrl: placeholderImg,
    alt: "Receive clinical-grade results in 6 days of testing",
  },
  {
    id: "egg-count",
    imageUrl: placeholderImg,
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

export function BentoGrid() {
  return (
    <section className="bentoGrid">
      <div className="bentoGrid__inner">
        {/* Top row — 3 cards */}
        <div className="bentoGrid__row bentoGrid__row--top">
          {cards.slice(0, 3).map((card) => (
            <div key={card.id} className={`bentoGrid__card bentoGrid__card--${card.id}`}>
              <img
                className="bentoGrid__cardImg"
                src={card.imageUrl}
                alt={card.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div className="bentoGrid__row bentoGrid__row--bottom">
          {cards.slice(3).map((card) => (
            <div key={card.id} className={`bentoGrid__card bentoGrid__card--${card.id}`}>
              <img
                className="bentoGrid__cardImg"
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
