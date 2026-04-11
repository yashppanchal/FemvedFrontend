import { FaArrowRight } from "react-icons/fa";
import "./Retreats.scss";
import RevealOnScroll from "../components/RevealOnScroll";

const RETREATS_REGISTER_URL = "https://corporate.femved.com/retreats";

const STAT_ITEMS = [
  {
    headline: "3x more effective",
    body: "Immersive retreat experiences have been shown to be three times more effective at reducing cortisol levels.",
  },
  {
    headline: "80%",
    body: "Of women report significant reduction in stress, anxiety, and hormonal symptoms after a wellness retreat.",
  },
  {
    headline: "25% improvement",
    body: "In overall quality of life reported by women who participate in structured wellness retreat programmes.",
  },
] as const;

export default function Retreats() {
  return (
    <section className="page retreats">
      <RevealOnScroll className="retreats__hero">
        <div className="retreats__heroOverlay" aria-hidden />
        <div className="retreats__heroInner container">
          <div className="retreats__heroMain">
            <h1 className="retreats__heroTitle">
              The Most Powerful Thing You Can Do For Your Health Is{" "}
              <em className="retreats__heroEm">This</em>
            </h1>
            <p className="retreats__heroSubtext">
              Wellbeing looks different for everyone. We respect that, in fact, we&apos;re built
              around it. Discover expert-led global retreats across medicine, movement,
              mindfulness and travel.
            </p>
            <a
              className="retreats__cta"
              href={RETREATS_REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register now
              <FaArrowRight className="retreats__ctaIcon" aria-hidden />
            </a>
          </div>

          <ul className="retreats__stats" aria-label="Retreat impact highlights">
            {STAT_ITEMS.map((item) => (
              <li key={item.headline} className="retreats__statCard">
                <p className="retreats__statHeadline">{item.headline}</p>
                <p className="retreats__statBody">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </RevealOnScroll>
    </section>
  );
}
