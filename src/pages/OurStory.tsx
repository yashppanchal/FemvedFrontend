import "./About.scss";
import "./FoundersStory.scss";
import "./OurStory.scss";
import type { IconType } from "react-icons";
import {
  FaFlask,
  FaGlobe,
  FaHeart,
  FaLinkedinIn,
  FaUser,
  FaVenus,
} from "react-icons/fa";
import { FaFileLines, FaUserDoctor } from "react-icons/fa6";
import { Link } from "react-router-dom";
import RevealOnScroll from "../components/RevealOnScroll";
import { usePageTitle } from "../usePageTitle";

const CORE_VALUES: Array<{
  index: string;
  title: string;
  body: string;
  icon: IconType;
  tone: "purple" | "green" | "pink" | "orange";
}> = [
  {
    index: "01",
    title: "Rooted in real expertise",
    body: "Every solution is grounded in qualified medical professionals and certified practitioners. Wisdom without credentials is just noise.",
    icon: FaGlobe,
    tone: "purple",
  },
  {
    index: "02",
    title: "Wellness that fits your life",
    body: "Holistic health should never feel like another thing on your to-do list. We make it personal, gentle, and genuinely easy to live with.",
    icon: FaUser,
    tone: "green",
  },
  {
    index: "03",
    title: "Technology in service of you",
    body: "We use intelligent technology not to replace human care, but to make expert guidance smarter, more targeted, and more effective for every woman.",
    icon: FaFileLines,
    tone: "pink",
  },
  {
    index: "04",
    title: "You deserve to trust this",
    body: "Women have been let down by wellness for too long. Every recommendation, every expert we platform, every solution is held to the highest standard of care.",
    icon: FaHeart,
    tone: "orange",
  },
];

const TRUST_BADGES: Array<{
  label: string;
  value: string;
  detail?: string;
  icon: IconType;
}> = [
  {
    label: "Accredited by",
    value: "Global Medical Experts",
    detail: "(in field of integrative medicine)",
    icon: FaUserDoctor,
  },
  {
    label: "Founded by",
    value: "Women, Across Cultures & Continents",
    icon: FaVenus,
  },
  {
    label: "Solutions that are",
    value: "Functional & Science Backed",
    icon: FaFlask,
  },
  {
    label: "Built on",
    value: "Empathy & Trust",
    icon: FaHeart,
  },
];

export default function OurStory() {
  usePageTitle("Our story");
  return (
    <section className="page ourStory">
      {/* ── Hero ── */}
      <RevealOnScroll className="about__hero">
        {/* <p className="about__heroLabel">Our story</p> */}
        <h1 className="about__heroTitle">
          Own your wellness — your well-being matters.
        </h1>
      </RevealOnScroll>

      {/* ── Section 1: We hear you ── */}
      <div className="ourStory__mainSection ourStory__mainSection--voice">
        <RevealOnScroll className="foundersStory__section foundersStory__section--awakening">
          <div className="about__prose">
            {/* <h2 className="ourStory__sectionHeading">We hear you</h2> */}
            <p>
              Are you searching everywhere for solutions, or really for
              permission? Permission to slow down, to stop following every
              trend, to admit that what works for someone else&apos;s body may
              not work for yours.
            </p>
            <p>
              Maybe wellness was never about fixing yourself. Maybe you were
              never broken.
            </p>
            <p>
              What if it is quieter than you thought. Not a transformation, but
              a relationship. Listening when your body whispers instead of
              waiting for it to scream. Nurturing yourself not as a reward after
              burnout, but as a daily act of respect.
            </p>
            <p>
              And maybe the most modern thing you can say today is, &quot;I do
              not need more information. I need a deeper connection with
              myself.&quot;
            </p>
            <p>If this hits home, Femved is the space just for you.</p>
            <p className="ourStory__supportLine">
              {/* big size ourStory__coreValuesHeadingSoft */}
              we&apos;re here to make sure you&apos;re seen, heard, and
              supported on this journey.
            </p>
          </div>
        </RevealOnScroll>
      </div>

      {/* <div className="ourStory__sectionDivider" aria-hidden="true">
        <span className="ourStory__sectionDividerLine" />
        <span className="ourStory__sectionDividerGem" />
        <span className="ourStory__sectionDividerLine" />
      </div> */}

      {/* ── Section 2: Core values + trust ── */}
      <div className="ourStory__mainSection ourStory__mainSection--values">
        <RevealOnScroll className="about__section about__section--searching ourStory__coreValuesBand">
          <div className="ourStory__coreValues">
            <header className="ourStory__coreValuesHeader">
              <h2 className="ourStory__coreValuesHeading">
                <span className="ourStory__coreValuesHeadingStrong">
                  What we stand for
                </span>
                <span className="ourStory__coreValuesHeadingSoft">
                  and won&apos;t compromise on.
                </span>
              </h2>
              <p className="ourStory__coreValuesIntro">
                We&apos;re here to make sure you&apos;re seen, heard, and
                supported on this journey.
              </p>
            </header>

            <ul className="ourStory__coreValuesGrid" role="list">
              {CORE_VALUES.map(({ index, title, body, icon: Icon, tone }) => (
                <li
                  key={index}
                  className={`ourStory__coreValuesCell ourStory__coreValuesCell--${tone}`}
                >
                  <span
                    className="ourStory__coreValuesIndex"
                    aria-hidden="true"
                  >
                    {index}
                  </span>
                  <div
                    className="ourStory__coreValuesIconWrap"
                    aria-hidden="true"
                  >
                    <Icon className="ourStory__coreValuesIcon" />
                  </div>
                  <h3 className="ourStory__coreValuesTitle">{title}</h3>
                  <p className="ourStory__coreValuesBody">{body}</p>
                </li>
              ))}
            </ul>

            <footer className="ourStory__coreValuesFooter">
              <p className="ourStory__coreValuesRevolution">
                — The wellness revolution starts here.
              </p>
              <Link className="ourStory__coreValuesCta" to="/register">
                JOIN FEMVED →
              </Link>
            </footer>
          </div>
        </RevealOnScroll>

        {/* ── Trust badges ── */}
        <RevealOnScroll className="ourStory__trustStrip">
          <div className="ourStory__trustGrid" role="list">
            {TRUST_BADGES.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className="ourStory__trustItem" role="listitem">
                <div className="ourStory__trustIconWrap" aria-hidden="true">
                  <Icon className="ourStory__trustIcon" />
                </div>
                <div className="ourStory__trustCopy">
                  <p className="ourStory__trustLabel">{label}</p>
                  <p className="ourStory__trustValue">{value}</p>
                  {detail ? (
                    <p className="ourStory__trustDetail">{detail}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>

      <div className="ourStory__sectionDivider" aria-hidden="true">
        <span className="ourStory__sectionDividerLine" />
        <span className="ourStory__sectionDividerGem" />
        <span className="ourStory__sectionDividerLine" />
      </div>

      {/* ── Section 3: Founders story ── */}
      <div className="ourStory__mainSection ourStory__mainSection--founders">
        <RevealOnScroll className="ourStory__foundersStoryIntro">
          <h2 className="ourStory__sectionHeading ourStory__foundersStoryTitle">
            Founders story
          </h2>
        </RevealOnScroll>

        <div className="ourStory__proseBridge" aria-hidden="true">
          <span className="ourStory__proseBridgeLine" />
          <span className="ourStory__proseBridgeGem" />
          <span className="ourStory__proseBridgeLine" />
        </div>

        <RevealOnScroll className="foundersStory__section foundersStory__section--opening">
          <div className="foundersStory__prose">
            <p>
              Change is happening all around the globe, and Femved is honoured
              to be part of this. So, what&apos;s our role?
            </p>
            <p>
              Women have always known something was off. We track, research,
              share, and self-advocate because the system was never built with
              us in mind. The information is everywhere now, but so is the
              overwhelm. Awareness has outpaced answers, and women are left
              drowning in noise with no one they truly trust.
            </p>
          </div>
        </RevealOnScroll>

        <div className="ourStory__proseBridge" aria-hidden="true">
          <span className="ourStory__proseBridgeLine" />
          <span className="ourStory__proseBridgeGem" />
          <span className="ourStory__proseBridgeLine" />
        </div>

        <RevealOnScroll className="foundersStory__section foundersStory__section--awakening">
          <div className="foundersStory__prose">
            <p>
              The ancient sciences knew our bodies before modern medicine tried
              to. Ayurveda, naturopathy, yoga, Traditional Chinese Medicine.
              These were never just remedies, they were entire philosophies
              built around the female body. And today, science is finally
              catching up. Genomics is validating what Ayurveda always knew.
              Breathwork is in clinical trials. Adaptogens are in functional
              medicine. The wisdom was never wrong, it just needed the research
              and credibility, modern authenticity and data driven evidence.
            </p>
          </div>
        </RevealOnScroll>

        <div className="ourStory__proseBridge" aria-hidden="true">
          <span className="ourStory__proseBridgeLine" />
          <span className="ourStory__proseBridgeGem" />
          <span className="ourStory__proseBridgeLine" />
        </div>

        <RevealOnScroll className="foundersStory__section foundersStory__section--philosophy">
          <div className="foundersStory__prose">
            <p>
              Femved is where that convergence lives. We are reimagining
              holistic wellness for women by blending trusted expert knowledge,
              intelligent technology, and deeply personalised care into one
              platform built for how women actually live today. Not a
              supplement, not a trend, but a complete modern ecosystem where
              ancient wisdom meets your real life and where, for the first time,
              the most effective solution finds you.
            </p>
          </div>
        </RevealOnScroll>

        {/* ── Letter closing ── */}
        <RevealOnScroll className="ourStory__letterClosing">
          <div className="ourStory__letterClosingInner">
            <p className="ourStory__letterSalutation">With love,</p>
            <p className="ourStory__letterName">Aditi Ayare</p>
            <p className="ourStory__letterRole">Founder and Director</p>
            <a
              className="ourStory__letterLinkedIn"
              href="https://www.linkedin.com/in/aditiayare/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn
                aria-hidden
                className="ourStory__letterLinkedInIcon"
              />
              <span>LinkedIn</span>
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
