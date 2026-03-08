import "./JourneyStages.scss";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";
// import healthConcernsImg from "../assets/homepage/health-concerns.jpg";
// import lifestageImg from "../assets/homepage/lifestage.jpg";
// import lifestyle2Img from "../assets/homepage/lifestyle2.jpg";

type StageCard = {
  title: string;
  description: string;
  imageUrl: string;
};

const healthConcernsImg =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965682/health-concerns_z6hqtw.jpg";
const lifestageImg =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965682/lifestage_igxpit.jpg";
const lifestyle2Img =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965681/lifestyle2_wpyggx.jpg";

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
            Holistic wellness plans are not meant to be curated by generic{" "}
            <em>algorithms.</em>
          </h2>
          <p className="journeyStages__sub">
            It should evolve with every season of your life. Where are you right
            now, and what deserves your focus first?
          </p>
        </div>

        {/* Right — cards */}
        <div className="journeyStages__cards">
          {stages.map((stage) => (
            <div key={stage.title} className="stageCard">
              <img
                className="stageCard__bg"
                src={optimizeCloudinaryImageUrl(stage.imageUrl, {
                  width: 720,
                })}
                srcSet={buildCloudinarySrcSet(stage.imageUrl, [320, 480, 640, 800])}
                sizes="(max-width: 820px) 100vw, 45vw"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="stageCard__overlay" />

              <div className="stageCard__text">
                <h3 className="stageCard__title">{stage.title}</h3>
                <p className="stageCard__desc">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
