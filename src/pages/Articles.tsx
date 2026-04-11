import { FaArrowRight } from "react-icons/fa";
import "./Articles.scss";
import RevealOnScroll from "../components/RevealOnScroll";

const SUBSTACK_URL = "https://femved.substack.com/";

export default function Articles() {
  return (
    <section className="page articles">
      {/* ── Hero ── */}
      <RevealOnScroll className="articles__hero">
        <h1 className="articles__heroTitle">
          Trusted Health Insights, Written by Experts
        </h1>
      </RevealOnScroll>

      {/* ── Intro copy + CTA ── */}
      <RevealOnScroll className="articles__intro">
        <div className="articles__introProse">
          <p>
            Everything you have ever wanted to know about your body, finally explained
            in a way that actually makes sense. You will find user stories that feel like
            your own, expert articles that explain the why behind every solution, and
            honest conversations about what wellness actually looks like in a woman’s
            real life.
          </p>
          <p>Come curious. Leave knowing more about yourself than you did before.</p>
          <a
            className="articles__subscribeBtn"
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Find out more
            <FaArrowRight className="articles__subscribeIcon" aria-hidden />
          </a>
        </div>
      </RevealOnScroll>
    </section>
  );
}
