import { FaArrowRight } from "react-icons/fa";
import "./Articles.scss";
import RevealOnScroll from "../components/RevealOnScroll";

const CORPORATE_URL = "https://corporate.femved.com/";

export default function Workplaces() {
  return (
    <section className="page articles">
      {/* ── Hero ── */}
      <RevealOnScroll className="articles__hero">
        <h1 className="articles__heroTitle">
          A New Standard in Employee Wellbeing By Femved
        </h1>
      </RevealOnScroll>

      {/* ── Intro copy + CTA ── */}
      <RevealOnScroll className="articles__intro">
        <div className="articles__introProse">
          <p>
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
