import "./Home.scss";
import { HeroCarousel } from "../components/HeroCarousel";
import { JourneyStages } from "../components/JourneyStages";
import { BenefitsBentoGrid } from "../components/BenefitsBentoGrid";
// import { WellnessLibrary } from "../components/WellnessLibrary";
import { PodcastSection } from "../components/PodcastSection";
import { CommunitySection } from "../components/CommunitySection";

export default function Home() {
  return (
    <div className="home">
      <HeroCarousel />
      <JourneyStages />
      <BenefitsBentoGrid />
      {/* <WellnessLibrary /> */}
      <PodcastSection />
      <CommunitySection />
    </div>
  );
}
