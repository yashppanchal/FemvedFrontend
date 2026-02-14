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

      <section className="page page--home">
        <div className="container home__content">
          <h1 className="page__title">
            A women-led space for holistic wellness
          </h1>
          <p className="page__lead">
            Femved is where two journeys meet: women practitioners who have
            walked through pain, found their way to heal, and now guide others —
            and women choosing awareness, independence, and self-work.
          </p>

          <div className="card">
            <h2 className="card__title">What we’re building (MVP)</h2>
            <p className="card__text">
              An insider meet-up platform for women’s wellness — helping you
              match with trusted experts, choose programs that fit your life
              stage, and make conscious healthy living feel natural in everyday
              life.
            </p>
          </div>

          <div style={{ height: 14 }} />

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">In the platform</h2>
            <ul className="list">
              <li>
                Choose experts and personalised lifestyle plans / programs /
                classes.
              </li>
              <li>
                Access credible, health-related information (including sponsored
                ad-space).
              </li>
              <li>
                Purchase pre-recorded sessions and guided practices for mental
                and physical needs.
              </li>
              <li>
                Join the community through meet-ups, events, retreats, and
                travel experiences (hosted by Femved or local experts).
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
