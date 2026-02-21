import "./GuidedProgramDetail.scss";
import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import dataJson from "../data/data.json";
import heroImage from "../assets/hero-slide-2.svg";
import hormonal from "../assets/guided-care-hero/hormonal.jpg";
import longevity from "../assets/guided-care-hero/longevity.jpg";
import fitness from "../assets/guided-care-hero/fitness.jpg";
import mind from "../assets/guided-care-hero/mind.jpg";

const GUIDED_CARE_HERO_IMAGES: Record<string, string> = {
  hormonal,
  mind,
  longevity,
  fitness,
};
import easyConnect from "../assets/benefits-guided-care/easyconnect.jpg";
import comprehensivePersonal from "../assets/benefits-guided-care/comprehensive.jpg";
import freedomToCoCreate from "../assets/benefits-guided-care/cocreate.jpg";
import completePrivacy from "../assets/benefits-guided-care/privacy.jpg";
// import appointmentMock from "../assets/appointment-mock.png";

type GuidedProgramInfo = {
  slug?: string;
  programType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel?: string;
  ctaTo?: string;
  whatsIncluded?: string[];
  keyAreas?: string[];
  imageSlug?: string;
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
  const carouselRef = useRef<HTMLDivElement | null>(null);

  if (!program) {
    return (
      <section className="page guidedProgramDetail">
        <h1 className="page__title">Guided program not found</h1>
        <p className="page__lead">
          This guided program doesn’t exist yet. Go back{" "}
          <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  const whatsIncluded = program.whatsIncluded ?? [];
  const keyAreas = program.keyAreas ?? [];

  const dummyCards = [
    {
      programName: "Break the Stress – Hormone Health Triangle",
      expertName: "Dr. Prathima Nagesh",
      tag: "Fertility Nurse",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi porta lectus a ligula lobortis, id iaculis ex tristique.",
    },
    {
      programName: "The Happy Hormone Method",
      expertName: "Kimberly Parsons, Naturopath & Herbalist",
      tag: "Women’s Health",
      body: "Whole-person care focused on hormones, cycles, and long-term wellbeing.",
    },
    {
      programName: "Balancing & Managing Perimenopause with Ayurveda",
      expertName: "Dr. Prathima Nagesh",
      tag: "Registered Dietitian",
      body: "Nutrition care shaped around your goals, preferences, and real life.",
    },
    {
      programName: "The Metabolic PCOS Reset",
      expertName: "Kimberly Parsons, Naturopath & Herbalist",
      tag: "Lifestyle Coach",
      body: "Habit and lifestyle support with compassion, clarity, and consistency.",
    },
  ];

  const zigzagItems = [
    {
      title: "Easy to connect",
      body: "Choose a ready-to-start wellness program and book instantly, with no appointments or fixed timelines. You and your expert decide the pace and connect online at a time that fits your life.",
      imageAlt: "Booking flow on tablet",
      imageSrc: easyConnect,
    },
    {
      title: "Comprehensive and extremely personal",
      body: "Your journey starts with a one-on-one consultation and moves into a clear action plan, which may include tailored meals, routines, movement guidance, supplement recommendations, and a personalised shopping list, depending on the expert’s guidance.",
      imageAlt: "Choose your specialist on tablet",
      imageSrc: comprehensivePersonal,
    },
    {
      title: "Freedom to co-create",
      body: "This isn’t a fixed or algorithm-led plan. You meet the expert you choose, they understand your health and life stage, and together you co-create a wellness plan that fits you, not a mass solution.",
      imageAlt: "Online consultation on tablet",
      imageSrc: freedomToCoCreate,
    },
    // {
    //   title: "Not algorithmic nor mass solutions",
    //   body: "Leave each session with next steps that make sense for you—clear, practical, and easy to action.",
    //   imageAlt: "Follow-up plan on tablet",
    //   imageSrc: appointmentMock,
    // },
    {
      title: "Complete privacy",
      body: "Your program is shaped only between you and your expert. We don’t store your personal health data, and your conversations remain fully private, protected by complete expert–client confidentiality.",
      imageAlt: "Next steps summary on tablet",
      imageSrc: completePrivacy,
    },
  ];

  // const recordingProducts = [
  //   {
  //     id: "cycle-sync-reset",
  //     title: "Cycle Sync Reset (60 min)",
  //     subtitle: "A calming practice to support rhythm + energy",
  //     price: "£19",
  //     tags: ["Video", "Beginner", "60 min"],
  //   },
  //   {
  //     id: "pcos-support",
  //     title: "PCOS Support Series (3 videos)",
  //     subtitle: "Food + lifestyle foundations you can repeat",
  //     price: "£39",
  //     tags: ["Video", "Intermediate", "3-part"],
  //   },
  //   {
  //     id: "nervous-system-soothe",
  //     title: "Soothe Your Nervous System (45 min)",
  //     subtitle: "Breathwork + grounding for busy weeks",
  //     price: "£15",
  //     tags: ["Video", "All levels", "45 min"],
  //   },
  //   {
  //     id: "menopause-clarity",
  //     title: "Menopause Clarity (75 min)",
  //     subtitle: "Practical support for sleep, mood, and heat",
  //     price: "£29",
  //     tags: ["Video", "All levels", "75 min"],
  //   },
  //   {
  //     id: "fertility-foundations",
  //     title: "Fertility Foundations (50 min)",
  //     subtitle: "Nourishment + habit rituals to build consistency",
  //     price: "£18",
  //     tags: ["Video", "Beginner", "50 min"],
  //   },
  //   {
  //     id: "deep-rest-yoga-nidra",
  //     title: "Deep Rest Yoga Nidra (30 min)",
  //     subtitle: "A reset for recovery and better sleep",
  //     price: "£12",
  //     tags: ["Video", "Beginner", "30 min"],
  //   },
  // ];

  return (
    <section className="page guidedProgramDetail">
      <div className="guidedProgramDetail__hero">
        <div className="guidedProgramDetail__heroMedia">
          <img
            className="guidedProgramDetail__heroImage"
            src={
              program.imageSlug && GUIDED_CARE_HERO_IMAGES[program.imageSlug]
                ? GUIDED_CARE_HERO_IMAGES[program.imageSlug]
                : heroImage
            }
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
            You’re getting more than advice or a one-time consultation.
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
          <h3 className="guidedProgramDetail__includedTitle">
            What’s included:
          </h3>

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
                carouselRef.current?.scrollBy({
                  left: -360,
                  behavior: "smooth",
                })
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
                <article
                  className="guidedProgramDetail__productCard"
                  key={c.programName}
                >
                  <div className="guidedProgramDetail__productMedia" />
                  <div className="guidedProgramDetail__productBody">
                    <h4 className="guidedProgramDetail__productName">
                      {c.programName}
                    </h4>
                    <p className="guidedProgramDetail__productSubtitle">
                      By <strong>{c.expertName}</strong>
                    </p>
                    {/* <span className="guidedProgramDetail__productTag">
                      {c.tag}
                    </span> */}
                    <p className="guidedProgramDetail__productText">{c.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="guidedProgramDetail__ctaBanner">
        <h2 className="guidedProgramDetail__ctaBannerTitle">
          Discover the program that truly speaks to your life and needs.
        </h2>
        <PrimaryButton label="Select your plan" onClick={() => {}} />
      </div>

      <section
        className="guidedProgramDetail__zigzag"
        aria-labelledby="guidedProgramDetail-zigzag-title"
      >
        <div className="guidedProgramDetail__zigzagIntro">
          <h2
            id="guidedProgramDetail-zigzag-title"
            className="guidedProgramDetail__zigzagTitle"
          >
            Your wellness, your plan, guided by experts who understand
          </h2>
          <p className="guidedProgramDetail__zigzagSubtext">
            We offer 1-1 guidance by globally accredited experts and coaches to
            support your health with diet, lifestyle, and nutrition plans fully
            tailored to your lifestyle and medical history. But it is more than
            a personalised program. Here is what you can expect from our
            platform and our experts.
          </p>
        </div>

        <div className="guidedProgramDetail__zigzagRows">
          {zigzagItems.map((item, idx) => (
            <article
              key={`${item.title}-${idx}`}
              className={`guidedProgramDetail__zigzagRow${
                idx % 2 ? " guidedProgramDetail__zigzagRow--reverse" : ""
              }`}
            >
              <div className="guidedProgramDetail__zigzagMedia">
                <img
                  className="guidedProgramDetail__zigzagImage"
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  loading="lazy"
                />
              </div>
              <div className="guidedProgramDetail__zigzagContent">
                <h3 className="guidedProgramDetail__zigzagItemTitle">
                  {item.title}
                </h3>
                <p className="guidedProgramDetail__zigzagItemBody">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* <section
        className="guidedProgramDetail__recordings"
        aria-labelledby="guidedProgramDetail-recordings-title"
      >
        <div className="container">
          <div className="guidedProgramDetail__recordingsIntro">
            <h2
              id="guidedProgramDetail-recordings-title"
              className="guidedProgramDetail__recordingsTitle"
            >
              Want to explore your wellness at your own pace? Start with our
              expert-led pre-recorded courses
            </h2>
            <p className="guidedProgramDetail__recordingsSubtext">
              A small collection of digital products — guided sessions you can
              return to anytime. (Dummy content for now.)
            </p>
          </div>

          <div className="guidedProgramDetail__recordingsGrid" role="list">
            {recordingProducts.map((p) => (
              <article
                key={p.id}
                className="guidedProgramDetail__recordingCard"
                role="listitem"
              >
                <div className="guidedProgramDetail__recordingMedia">
                  <img
                    className="guidedProgramDetail__recordingImage"
                    src={appointmentMock}
                    alt={`Cover for ${p.title}`}
                    loading="lazy"
                  />
                  <div className="guidedProgramDetail__recordingBadges">
                    {p.tags.map((t) => (
                      <span
                        key={`${p.id}-${t}`}
                        className="guidedProgramDetail__recordingBadge"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="guidedProgramDetail__recordingBody">
                  <h3 className="guidedProgramDetail__recordingTitle">
                    {p.title}
                  </h3>
                  <p className="guidedProgramDetail__recordingSubtitle">
                    {p.subtitle}
                  </p>

                  <div className="guidedProgramDetail__recordingFooter">
                    <span className="guidedProgramDetail__recordingPrice">
                      {p.price}
                    </span>
                    <PrimaryButton
                      label="Add to basket"
                      // className="guidedProgramDetail__recordingBtn"
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section> */}

      <TestimonialsCarousel />
    </section>
  );
}
