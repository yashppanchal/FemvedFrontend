import { FaArrowRight } from "react-icons/fa";
import "./Articles.scss";
import "./Workplaces.scss";
import RevealOnScroll from "../components/RevealOnScroll";

const CORPORATE_URL = "https://corporate.femved.com/";

export default function Workplaces() {
  return (
    <section className="page workplaces">
      <RevealOnScroll className="workplaces__hero">
        <div className="workplaces__heroOverlay" aria-hidden />
        <div className="workplaces__heroInner container">
          <h1 className="workplaces__heroTitle">
            A new standard in employee wellbeing by Femved
          </h1>
          <p className="workplaces__heroSubtext">
            Personalised wellbeing for modern teams, designed for sustainable
            performance. A science-backed wellness programme created by doctors,
            nutritionists and behavioural experts.
          </p>
          <a
            className="articles__subscribeBtn"
            href={CORPORATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
            <FaArrowRight className="articles__subscribeIcon" aria-hidden />
          </a>
        </div>
      </RevealOnScroll>
    </section>
  );
}
