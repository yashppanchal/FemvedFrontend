import "./JourneyStages.scss";
import healthConcernsImg from "../assets/homepage/health-concerns.jpg";
import lifestageImg from "../assets/homepage/lifestage.jpg";
import lifestyle2Img from "../assets/homepage/lifestyle2.jpg";

type StageCard = {
  title: string;
  description: string;
  imageUrl: string;
};

const stages: StageCard[] = [
  {
    title: "Health concerns",
    description:
      "Hormonal imbalance, Irregular periods, PMS, PCOS, Endometriosis",
    imageUrl: healthConcernsImg,
  },
  {
    title: "Lifestage support",
    description:
      "Perimenopause, Menopause, Fertility support, Menstrual health",
    imageUrl: lifestageImg,
  },
  {
    title: "Lifestyle concerns",
    description:
      "Stress, Chronic fatigue, Thyroid issues, Gut health, immune health",
    imageUrl: lifestyle2Img,
  },
];

export function JourneyStages() {
  return (
    <section className="journeyStages">
      <div className="journeyStages__inner">
        {/* Left — copy */}
        <div className="journeyStages__copy">
          <h2 className="journeyStages__heading">
            Holistic wellness plans are not meant to be curated by <br />
            generic <em>algorithms.</em>
          </h2>
          <p className="journeyStages__sub">
            It should evolve with every season of your life. Where are you right
            now, and what deserves your focus first?
          </p>
        </div>

        {/* Right — cards */}
        <div className="journeyStages__cards">
          {stages.map((stage) => (
            <a
              key={stage.title}
              className="stageCard"
              href="#"
              role="button"
              aria-label={stage.title}
            >
              <img
                className="stageCard__bg"
                src={stage.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="stageCard__overlay" />

              <div className="stageCard__text">
                <h3 className="stageCard__title">{stage.title}</h3>
                <p className="stageCard__desc">{stage.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
