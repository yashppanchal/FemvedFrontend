import "./About.scss";
import "./FoundersStory.scss";
import "./OurStory.scss";
import type { IconType } from "react-icons";
import { FaHeart, FaFlask, FaLinkedinIn, FaVenus } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import RevealOnScroll from "../components/RevealOnScroll";
import { usePageTitle } from "../usePageTitle";

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
        <p className="about__heroLabel">Our story</p>
        <h1 className="about__heroTitle">
          Own your wellness — your well-being matters.
        </h1>
      </RevealOnScroll>

      {/* ── We hear you ── */}
      <RevealOnScroll className="foundersStory__section foundersStory__section--awakening">
        <div className="about__prose">
          <h2 className="ourStory__sectionHeading">We hear you</h2>
          <p>
            Are you searching everywhere for solutions, or really for
            permission? Permission to slow down, to stop following every trend,
            to admit that what works for someone else&apos;s body may not work
            for yours.
          </p>
          <p>
            Maybe wellness was never about fixing yourself. Maybe you were never
            broken.
          </p>
          <p>
            What if it is quieter than you thought. Not a transformation, but a
            relationship. Listening when your body whispers instead of waiting for
            it to scream. Nurturing yourself not as a reward after burnout, but
            as a daily act of respect.
          </p>
          <p>
            And maybe the most modern thing you can say today is, &quot;I do not
            need more information. I need a deeper connection with myself.&quot;
          </p>
          <p>If this hits home, Femved is the space just for you.</p>
          <p className="ourStory__supportLine">
            we&apos;re here to make sure you&apos;re seen, heard, and supported
            on this journey.
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Our Core Values ── */}
      <RevealOnScroll className="about__section about__section--searching">
        <div className="ourStory__values">
          <h2 className="ourStory__sectionHeading">Our Core Values</h2>
          <ul className="ourStory__valuesList">
            <li className="ourStory__value">
              <span className="ourStory__valueIndex" aria-hidden="true">
                01
              </span>
              <div className="ourStory__valueBody">
                <h3 className="ourStory__valueTitle">
                  Rooted in Real Expertise
                </h3>
                <p>
                  Every solution we offer is grounded in the knowledge of
                  qualified medical professionals and certified practitioners.
                  Wisdom without credentials is just noise.
                </p>
              </div>
            </li>
            <li className="ourStory__value">
              <span className="ourStory__valueIndex" aria-hidden="true">
                02
              </span>
              <div className="ourStory__valueBody">
                <h3 className="ourStory__valueTitle">
                  Wellness That Fits Your Life
                </h3>
                <p>
                  Holistic health should never feel like another thing on your
                  to-do list. We make it personal, gentle, and genuinely easy to
                  live with.
                </p>
              </div>
            </li>
            <li className="ourStory__value">
              <span className="ourStory__valueIndex" aria-hidden="true">
                03
              </span>
              <div className="ourStory__valueBody">
                <h3 className="ourStory__valueTitle">
                  Technology in Service of You
                </h3>
                <p>
                  We use intelligent technology not to replace human care, but
                  to make expert guidance smarter, more targeted, and more
                  effective for every woman.
                </p>
              </div>
            </li>
            <li className="ourStory__value">
              <span className="ourStory__valueIndex" aria-hidden="true">
                04
              </span>
              <div className="ourStory__valueBody">
                <h3 className="ourStory__valueTitle">
                  You Deserve to Trust This
                </h3>
                <p>
                  Women have been let down by wellness for too long. Every
                  recommendation we make, every expert we platform, every
                  solution we offer is held to the highest standard of
                  credibility and care.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="ourStory__miniRevolution">
        <p className="ourStory__revolutionLine">
          The wellness revolution starts here.
        </p>
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

      {/* ── Founders story ── */}
      <RevealOnScroll className="ourStory__foundersStoryIntro">
        <h2 className="ourStory__sectionHeading ourStory__foundersStoryTitle">
          Founders story
        </h2>
      </RevealOnScroll>

      <RevealOnScroll className="foundersStory__section foundersStory__section--opening">
        <div className="foundersStory__prose">
          <p>
            Change is happening all around the globe, and Femved is honoured to
            be part of this. So, what&apos;s our role?
          </p>
          <p>
            Women have always known something was off. We track, research, share,
            and self-advocate because the system was never built with us in mind.
            The information is everywhere now, but so is the overwhelm. Awareness
            has outpaced answers, and women are left drowning in noise with no one
            they truly trust.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="foundersStory__section foundersStory__section--awakening">
        <div className="foundersStory__prose">
          <p>
            The ancient sciences knew our bodies before modern medicine tried to.
            Ayurveda, naturopathy, yoga, Traditional Chinese Medicine. These were
            never just remedies, they were entire philosophies built around the
            female body. And today, science is finally catching up. Genomics is
            validating what Ayurveda always knew. Breathwork is in clinical
            trials. Adaptogens are in functional medicine. The wisdom was never
            wrong, it just needed the research and credibility, modern
            authenticity and data driven evidence.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="foundersStory__section foundersStory__section--philosophy">
        <div className="foundersStory__prose">
          <p>
            Femved is where that convergence lives. We are reimagining holistic
            wellness for women by blending trusted expert knowledge, intelligent
            technology, and deeply personalised care into one platform built for
            how women actually live today. Not a supplement, not a trend, but a
            complete modern ecosystem where ancient wisdom meets your real life
            and where, for the first time, the most effective solution finds
            you.
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
            <FaLinkedinIn aria-hidden className="ourStory__letterLinkedInIcon" />
            <span>LinkedIn</span>
          </a>
        </div>
      </RevealOnScroll>
    </section>
  );
}
