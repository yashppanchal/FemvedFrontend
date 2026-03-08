import { useRef } from "react";
import { Link } from "react-router-dom";
import RevealOnScroll from "../RevealOnScroll";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../../cloudinary/image";

export type ProgramCard = {
  programId?: string;
  programName: string;
  expertName: string;
  body: string;
  imageUrl?: string;
};

export const CHOOSE_SECTION_ID = "guided-program-choose-section";

type ChooseSectionProps = {
  keyAreas: string[];
  programs: ProgramCard[];
  programSlug: string;
};

export function ChooseSection({
  keyAreas,
  programs,
  programSlug,
}: ChooseSectionProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="guidedProgramDetail__choose" id={CHOOSE_SECTION_ID}>
      <div className="guidedProgramDetail__chooseLeft">
        <RevealOnScroll className="guidedProgramDetail__chooseTitleReveal">
          <h2 className="guidedProgramDetail__chooseTitle">
            Choose and book the guided journey that best fits your needs, goals,
            and life right now.
          </h2>
        </RevealOnScroll>

        <h3 className="guidedProgramDetail__chooseListTitle">
          Key Areas where you can receive personalised support:
        </h3>

        {keyAreas.length ? (
          <RevealOnScroll className="guidedProgramDetail__keyAreas">
            {keyAreas.map((area, idx) => (
              <li
                className="guidedProgramDetail__keyArea"
                key={idx}
                style={{ transitionDelay: `${idx * 180}ms` }}
              >
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
          </RevealOnScroll>
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
                      src={optimizeCloudinaryImageUrl(c.imageUrl, {
                        width: 640,
                        crop: "fill",
                      })}
                      srcSet={buildCloudinarySrcSet(c.imageUrl, [320, 480, 640, 800], {
                        crop: "fill",
                      })}
                      sizes="(max-width: 768px) 82vw, 360px"
                      alt={c.programName}
                      loading="lazy"
                      decoding="async"
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
                  {c.programId ? (
                    <Link
                      className="guidedProgramDetail__productDetailsLink"
                      to={`/guided/${programSlug}/${c.programId}`}
                    >
                      View Details
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
            {programs.length === 1 ? (
              <article
                className="guidedProgramDetail__productCard guidedProgramDetail__productCard--comingSoon"
                key="more-coming-soon"
              >
                <div className="guidedProgramDetail__productBody guidedProgramDetail__productBody--comingSoon">
                  <h4 className="guidedProgramDetail__productName guidedProgramDetail__productName--comingSoon">
                    More coming soon
                  </h4>
                  <p className="guidedProgramDetail__productText">
                    We&apos;re adding more guided programs soon. Stay tuned.
                  </p>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
