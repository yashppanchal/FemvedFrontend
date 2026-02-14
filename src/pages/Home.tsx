import "./Home.scss";
import { HeroCarousel } from "../components/HeroCarousel";
import { JourneyStages } from "../components/JourneyStages";
import { BenefitsBentoGrid } from "../components/BenefitsBentoGrid";
import { WellnessLibrary } from "../components/WellnessLibrary";
import { PodcastSection } from "../components/PodcastSection";

export default function Home() {
  return (
    <div className="home">
      <HeroCarousel />
      <JourneyStages />
      <BenefitsBentoGrid />
      <WellnessLibrary />
      <PodcastSection />
    </div>
  );
}
