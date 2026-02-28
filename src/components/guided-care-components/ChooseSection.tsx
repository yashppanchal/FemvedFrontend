import { useRef } from "react";

export type ProgramCard = {
  programName: string;
  expertName: string;
  body: string;
  imageUrl?: string;
};

type ChooseSectionProps = {
  keyAreas: string[];
  programs: ProgramCard[];
};

export function ChooseSection({ keyAreas, programs }: ChooseSectionProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  return (
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
            {programs.map((c) => (
              <article
                className="guidedProgramDetail__productCard"
                key={c.programName}
              >
                <div className="guidedProgramDetail__productMedia">
                  {c.imageUrl ? (
                    <img
                      className="guidedProgramDetail__productMediaImage"
                      src={c.imageUrl}
                      alt={c.programName}
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="guidedProgramDetail__productBody">
                  <h4 className="guidedProgramDetail__productName">
                    {c.programName}
                  </h4>
                  <p className="guidedProgramDetail__productSubtitle">
                    By <strong>{c.expertName}</strong>
                  </p>
                  <p className="guidedProgramDetail__productText">{c.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
