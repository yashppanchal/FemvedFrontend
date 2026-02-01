import "./GuidedProgramDetail.scss";
import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import dataJson from "../data/data.json";
import heroImage from "../assets/hero-slide-2.svg";

type GuidedProgramInfo = {
  slug?: string;
  programType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel?: string;
  ctaTo?: string;
  whatsIncluded?: string[];
  keyAreas?: string[];
};

type DataJsonShape = {
  data: Array<{
    name: string;
    info: GuidedProgramInfo[];
  }>;
};

function getGuidedProgramBySlug(programSlug: string | undefined) {
  if (!programSlug) return null;

  const root = dataJson as unknown as DataJsonShape;
  const guided = root.data.find((d) => d.name === "Guided 1:1 Care");
  if (!guided) return null;

  return guided.info.find((p) => p.slug === programSlug) ?? null;
}

export default function GuidedProgramDetail() {
  const { programSlug } = useParams<{ programSlug: string }>();
  const program = getGuidedProgramBySlug(programSlug);

  if (!program) {
    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">Guided program not found</h1>
        <p className="page__lead">
          This guided program doesn’t exist yet. Go back <Link to="/">home</Link>
          .
        </p>
      </section>
    );
  }

  const whatsIncluded = program.whatsIncluded ?? [];
  const keyAreas = program.keyAreas ?? [];
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const dummyCards = [
    {
      name: "Emily Moreton",
      subtitle: "BSc, MSc, RNutr, Registered Nurse",
      tag: "Fertility Nurse",
      body: "Support grounded in clinical experience and practical, personalised guidance.",
    },
    {
      name: "Olivia Wall",
      subtitle: "BSc, RD",
      tag: "Registered Dietitian",
      body: "Nutrition care shaped around your goals, preferences, and real life.",
    },
    {
      name: "Aisha Khan",
      subtitle: "MSc, Certified Health Coach",
      tag: "Lifestyle Coach",
      body: "Habit and lifestyle support with compassion, clarity, and consistency.",
    },
    {
      name: "Maya Patel",
      subtitle: "MBBS, Women’s Health",
      tag: "Women’s Health",
      body: "Whole-person care focused on hormones, cycles, and long-term wellbeing.",
    },
  ];

  return (
    <section className="page guidedProgramDetail">
      <div className="guidedProgramDetail__hero">
        <div className="guidedProgramDetail__heroMedia">
          <img
            className="guidedProgramDetail__heroImage"
            src={heroImage}
            alt={program.heroTitle}
          />
        </div>

        <div className="guidedProgramDetail__heroContent">
          <h1 className="page__title guidedProgramDetail__title">
            {program.heroTitle}
          </h1>
          <p className="page__lead guidedProgramDetail__subtext">
            {program.heroSubtext}
          </p>

          {program.ctaLabel && program.ctaTo ? (
            <div className="guidedProgramDetail__ctaRow">
              <PrimaryButton label={program.ctaLabel} to={program.ctaTo} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="guidedProgramDetail__more">
        <div className="guidedProgramDetail__moreContent">
          <h2 className="guidedProgramDetail__moreTitle">
            You’re getting more than advice or a one-time consultation. Book your
            online guided program now.
          </h2>
          <p className="guidedProgramDetail__moreBody">
            We promise care that is human, not formulaic. Our experts are
            independent, deeply specialised, and free from rigid, brand-led or
            algorithm-driven wellness formats, so what you receive is truly
            personalised and responsive to your life. Having guided thousands of
            women through different life stages, our experts offer experienced,
            empathetic support, delivered seamlessly online to make meaningful
            care accessible and stress-free.
          </p>
        </div>

        <aside className="guidedProgramDetail__included card">
          <h3 className="guidedProgramDetail__includedTitle">What’s included:</h3>

          {whatsIncluded.length ? (
            <ul className="guidedProgramDetail__includedList">
              {whatsIncluded.map((item, idx) => (
                <li className="guidedProgramDetail__includedItem" key={idx}>
                  <span
                    className="guidedProgramDetail__includedCheck"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="guidedProgramDetail__includedText">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="guidedProgramDetail__includedEmpty">
              What’s included details will be shared soon.
            </p>
          )}
        </aside>
      </div>

      <div className="guidedProgramDetail__choose">
        <div className="guidedProgramDetail__chooseLeft">
          <h2 className="guidedProgramDetail__chooseTitle">
            Choose and book the guided journey that best fits your needs, goals,
            and life right now.
          </h2>

          <h3 className="guidedProgramDetail__chooseListTitle">
            Key Areas where you can receive personalised support:
          </h3>

          {keyAreas.length ? (
            <ul className="guidedProgramDetail__keyAreas">
              {keyAreas.map((area, idx) => (
                <li className="guidedProgramDetail__keyArea" key={idx}>
                  <span
                    className="guidedProgramDetail__keyAreaCheck"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="guidedProgramDetail__keyAreaText">
                    {area.trim()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="guidedProgramDetail__keyAreasEmpty">
              Key areas will be shared soon.
            </p>
          )}
        </div>

        <div className="guidedProgramDetail__chooseRight">
          <div className="guidedProgramDetail__carouselControls">
            <button
              type="button"
              className="guidedProgramDetail__carouselBtn"
              aria-label="Scroll left"
              onClick={() =>
                carouselRef.current?.scrollBy({ left: -360, behavior: "smooth" })
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="guidedProgramDetail__carouselBtn"
              aria-label="Scroll right"
              onClick={() =>
                carouselRef.current?.scrollBy({ left: 360, behavior: "smooth" })
              }
            >
              ›
            </button>
          </div>

          <div
            className="guidedProgramDetail__carousel"
            ref={carouselRef}
            role="region"
            aria-label="Guided program experts"
          >
            <div className="guidedProgramDetail__carouselTrack">
              {dummyCards.map((c) => (
                <article className="guidedProgramDetail__productCard" key={c.name}>
                  <div className="guidedProgramDetail__productMedia" />
                  <div className="guidedProgramDetail__productBody">
                    <h4 className="guidedProgramDetail__productName">{c.name}</h4>
                    <p className="guidedProgramDetail__productSubtitle">
                      {c.subtitle}
                    </p>
                    <span className="guidedProgramDetail__productTag">
                      {c.tag}
                    </span>
                    <p className="guidedProgramDetail__productText">{c.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

