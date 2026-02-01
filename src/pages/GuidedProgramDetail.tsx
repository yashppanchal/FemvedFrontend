import "./GuidedProgramDetail.scss";
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
    </section>
  );
}

