import "./ProgramDetailPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  loadGuidedPrograms,
  normalizeSlug,
  type GuidedProgramInfo,
} from "../data/guidedPrograms";

export default function ProgramDetailPage() {
  const { programSlug, programId } = useParams<{
    programSlug: string;
    programId: string;
  }>();
  const [categories, setCategories] = useState<GuidedProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedDurationLabel, setSelectedDurationLabel] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);
      setHasError(false);

      try {
        const payload = await loadGuidedPrograms();
        if (isActive) {
          setCategories(payload);
        }
      } catch {
        if (isActive) {
          setHasError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedProgram = useMemo(() => {
    if (!programId) return null;

    const desiredCategorySlug = normalizeSlug(programSlug);
    const selectedCategory = categories.find((category) => {
      const mappedSlug = normalizeSlug(category.slug);
      return (
        mappedSlug === desiredCategorySlug || category.slug === programSlug
      );
    });

    if (!selectedCategory) return null;

    return (
      selectedCategory.programsInCategory?.find(
        (program) => program.programId === programId,
      ) ?? null
    );
  }, [categories, programId, programSlug]);

  useEffect(() => {
    const firstDurationLabel =
      selectedProgram?.programDurations?.[0]?.durationLabel ?? "";
    setSelectedDurationLabel(firstDurationLabel);
  }, [selectedProgram]);

  const selectedDuration = useMemo(() => {
    if (!selectedProgram?.programDurations?.length) return null;

    return (
      selectedProgram.programDurations.find(
        (duration) => duration.durationLabel === selectedDurationLabel,
      ) ?? selectedProgram.programDurations[0]
    );
  }, [selectedDurationLabel, selectedProgram]);

  if (loading) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Loading program...</h1>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Unable to load program</h1>
        <p className="page__lead">
          Please refresh and try again. Go back to <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  if (!selectedProgram) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Program not found</h1>
        <p className="page__lead">
          This program does not exist yet. Go back to <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page programDetailPage">
      <header
        className="programDetailPage__hero"
        style={
          selectedProgram.imageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(15, 15, 16, 0.35), rgba(15, 15, 16, 0.45)), url("${selectedProgram.imageUrl}")`,
              }
            : undefined
        }
      >
        <div className="programDetailPage__heroInner container">
          <h1 className="programDetailPage__title">
            {selectedProgram.programName}
          </h1>
          <p className="programDetailPage__meta">
            By <strong>{selectedProgram.expertName}</strong>
          </p>
        </div>
      </header>

      <div className="programDetailPage__contentWrap container">
        <article className="programDetailPage__content">
          <p>{selectedProgram.programPageDisplayDetails?.overview}</p>
          <h2>What you'll receive in this program:</h2>
          <ul>
            {selectedProgram.programPageDisplayDetails?.whatYouGet?.map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
          <h2>Who should join this program:</h2>
          <ul>
            {selectedProgram.programPageDisplayDetails?.whoIsThisFor?.map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
        </article>

        <aside className="programDetailPage__stickyCard">
          <h3 className="programDetailPage__priceTitle">
            {selectedDuration?.durationPrice ?? ""}
          </h3>
          <div className="programDetailPage__priceOptions">
            {selectedProgram.programDurations?.map((duration) => {
              const isActive = duration.durationLabel === selectedDurationLabel;
              return (
                <button
                  key={duration.durationLabel}
                  type="button"
                  className={`programDetailPage__priceBtn${isActive ? " programDetailPage__priceBtn--active" : ""}`}
                  onClick={() =>
                    setSelectedDurationLabel(duration.durationLabel)
                  }
                >
                  {duration.durationLabel}
                </button>
              );
            })}
          </div>
          {/* <p className="programDetailPage__priceText">
            This is the total amount for all lessons.
          </p>
          <p className="programDetailPage__priceSubtext">
            Pay extra to support our instructors and help create more courses.
            No matter how much you pay, you get the same course as everybody
            else.
          </p> */}
        </aside>
      </div>

      <section className="programDetailPage__expertSection">
        <div className="programDetailPage__expertInner container">
          <div className="programDetailPage__expertLeft">
            {selectedProgram.expertImageUrl ? (
              <img
                src={selectedProgram.expertImageUrl}
                alt={selectedProgram.expertName}
                className="programDetailPage__expertPhoto"
              />
            ) : (
              <div
                className="programDetailPage__expertPhotoFallback"
                aria-hidden="true"
              >
                {selectedProgram.expertName.charAt(0)}
              </div>
            )}
            <h3 className="programDetailPage__expertName">
              {selectedProgram.expertName}
            </h3>
            <p className="programDetailPage__expertTitle">
              {selectedProgram.expertTitle}
            </p>
          </div>
          <div className="programDetailPage__expertRight">
            <p>{selectedProgram.expertDescription}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a
              fringilla sem. Etiam pretium condimentum nulla, porttitor euismod
              urna dapibus ac. Nullam malesuada nunc metus, non sodales sapien
              pulvinar at. Ut id magna sed tortor dignissim pulvinar. Nunc
              blandit consectetur risus, malesuada eleifend ligula feugiat at.
              Phasellus eu rhoncus justo. Donec ipsum enim, bibendum ut mauris
              et, pulvinar pharetra elit. Duis iaculis felis ipsum, in volutpat
              metus imperdiet sed. Fusce sed risus quis nisi posuere mattis.
              Aliquam erat volutpat. Suspendisse potenti. Sed felis purus,
              vulputate at ultrices dignissim, dapibus vel orci. Quisque semper
              nunc euismod est ornare viverra. Donec laoreet libero in nulla
              laoreet pulvinar.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
