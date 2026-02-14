import "./JourneyStages.scss";

type StageCard = {
  title: string;
  description: string;
  imageUrl: string;
};

const stages: StageCard[] = [
  {
    title: "Managing symptoms",
    description:
      "Fatigue, irritability, anxiety, feeling cold, low mood, acne...",
    imageUrl:
      "https://images.unsplash.com/photo-1515894203077-9cd36032142f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Fertility",
    description: "Planning for the future or actively trying to conceive",
    imageUrl:
      "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Perimenopause or Menopause",
    description:
      "Menopausal or experiencing symptoms and looking for answers",
    imageUrl:
      "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&w=800&q=80",
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
