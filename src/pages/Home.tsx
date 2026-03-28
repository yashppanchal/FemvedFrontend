import "./Home.scss";
import { HeroCarousel } from "../components/HeroCarousel";
import { JourneyStages } from "../components/JourneyStages";
import { BenefitsBentoGrid } from "../components/BenefitsBentoGrid";
import { PodcastSection } from "../components/PodcastSection";
import { CommunitySection } from "../components/CommunitySection";
import { usePageTitle } from "../usePageTitle";

export default function Home() {
  usePageTitle("Women's Wellness Platform");
  return (
    <div className="home">
      <HeroCarousel />
      <JourneyStages />
      <BenefitsBentoGrid />
      <PodcastSection />
      <CommunitySection />
    </div>
  );
}
