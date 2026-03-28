import "./CategoryProgramsPage.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import {
  getGuidedProgramsSnapshot,
  loadGuidedPrograms,
  normalizeSlug,
  type GuidedProgramCard,
  type GuidedProgramInfo,
} from "../data/guidedPrograms";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";

export default function CategoryProgramsPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { country } = useCountry();
  const pageRef = useRef<HTMLElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [allCategories, setAllCategories] = useState<GuidedProgramInfo[]>(
    () => getGuidedProgramsSnapshot(country) ?? [],
  );
  const [loading, setLoading] = useState(
    () => getGuidedProgramsSnapshot(country) === null,
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    setHasError(false);

    const snapshot = getGuidedProgramsSnapshot(country);
    if (snapshot) {
      setAllCategories(snapshot);
      setLoading(false);
    } else {
      setAllCategories([]);
      setLoading(true);
    }

    loadGuidedPrograms(country)
      .then((data) => {
        if (isActive) {
          setAllCategories(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          if (!snapshot) setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [country]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (window.matchMedia("(max-width: 1100px)").matches) return;

      const sidebar = sidebarInnerRef.current;
      const footer = footerRef.current;
      const page = pageRef.current;
      if (!sidebar || !footer) return;

      const sidebarCanScroll = sidebar.scrollHeight - sidebar.clientHeight > 1;
      if (!sidebarCanScroll) return;

      if (event.deltaY > 0) {
        const sidebarRemainingScroll =
          sidebar.scrollHeight - sidebar.clientHeight - sidebar.scrollTop;
        if (sidebarRemainingScroll <= 1) return;

        const footerTop = footer.getBoundingClientRect().top;
        const triggerLine = window.innerHeight * 0.8;
        const footerReachedTriggerZone = footerTop <= triggerLine;
        if (!footerReachedTriggerZone) return;

        event.preventDefault();
        sidebar.scrollTop = Math.min(
          sidebar.scrollTop + event.deltaY,
          sidebar.scrollHeight - sidebar.clientHeight,
        );
        return;
      }

      if (event.deltaY < 0) {
        if (!page) return;
        if (sidebar.scrollTop <= 1) return;

        const pageTop = page.getBoundingClientRect().top;
        const pageAtTopBoundary = pageTop >= 0;
        if (!pageAtTopBoundary) return;

        event.preventDefault();
        sidebar.scrollTop = Math.max(0, sidebar.scrollTop + event.deltaY);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const category = useMemo(() => {
    if (!categorySlug) return null;
    const desired = normalizeSlug(categorySlug);
    return (
      allCategories.find(
        (c) => c.slug === categorySlug || normalizeSlug(c.slug) === desired,
      ) ?? null
    );
  }, [categorySlug, allCategories]);

  const programs: GuidedProgramCard[] = category?.programsInCategory ?? [];
  const whatsIncluded: string[] = category?.whatsIncluded ?? [];
  const keyAreas: string[] = category?.keyAreas ?? [];

  if (loading) {
    return (
      <section className="page categoryProgramsPage" ref={pageRef}>
        <p className="categoryProgramsPage__loading">Loading programs…</p>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page categoryProgramsPage" ref={pageRef}>
        <h1 className="page__title">Unable to load programs</h1>
        <p className="page__lead">
          Please refresh and try again or go back <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  if (!category) {
    return (
      <section className="page categoryProgramsPage" ref={pageRef}>
        <h1 className="page__title">Category not found</h1>
        <p className="page__lead">
          <Link to="/all-guided-programs">Browse all programs</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page categoryProgramsPage" ref={pageRef}>
      {/* <div className="categoryProgramsPage__pageTop">
        <Link
          className="categoryProgramsPage__backLink"
          to={`/guided/${categorySlug}`}
        >
          ← Back to {category.programType}
        </Link>
      </div> */}
      {/* ── Two-panel layout ─────────────────────────────────────────────── */}
      <div className="categoryProgramsPage__layout">
        {/* ── Left sticky sidebar ───────────────────────────────────────── */}
        <aside className="categoryProgramsPage__sidebar">
          <div className="categoryProgramsPage__pageTop">
            <Link
              className="categoryProgramsPage__backLink"
              to={`/guided/${categorySlug}`}
            >
              ← Back to {category.programType}
            </Link>
          </div>
          <div
            className="categoryProgramsPage__sidebarInner"
            ref={sidebarInnerRef}
          >
            <div className="categoryProgramsPage__sidebarHead">
              <p className="categoryProgramsPage__eyebrow">Guided 1:1 Care</p>
              <h1 className="categoryProgramsPage__title">
                {category.programType}
              </h1>
              {category.heroSubtext && (
                <p className="page__lead categoryProgramsPage__subtext">
                  {category.heroSubtext}
                </p>
              )}
            </div>

            {whatsIncluded.length > 0 && (
              <div className="categoryProgramsPage__included">
                <h2 className="categoryProgramsPage__sectionHeading">
                  What's included
                </h2>
                <ul className="categoryProgramsPage__includedList">
                  {whatsIncluded.map((item, i) => (
                    <li key={i} className="categoryProgramsPage__includedItem">
                      <span
                        className="categoryProgramsPage__includedCheck"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {keyAreas.length > 0 && (
              <div className="categoryProgramsPage__keyAreas">
                <h2 className="categoryProgramsPage__sectionHeading">
                  Key areas
                </h2>
                <div className="categoryProgramsPage__keyAreaChips">
                  {keyAreas.map((area, i) => (
                    <span key={i} className="categoryProgramsPage__keyAreaChip">
                      {area.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* <div className="categoryProgramsPage__sidebarMeta">
              <span className="categoryProgramsPage__programsBadge">
                {programs.length} {programs.length === 1 ? "program" : "programs"} available
              </span>
            </div> */}
          </div>
        </aside>

        {/* ── Right: programs grid ──────────────────────────────────────── */}
        <div className="categoryProgramsPage__main">
          <div className="categoryProgramsPage__mainHeader">
            <h2 className="categoryProgramsPage__programsTitle">
              Choose the program that's right for you
            </h2>
          </div>

          {programs.length === 0 ? (
            <div className="card categoryProgramsPage__empty">
              <h2 className="card__title">No programs yet</h2>
              <p className="card__text">
                Programs for this category are coming soon.{" "}
                <Link to="/all-guided-programs">Browse all programs</Link>.
              </p>
            </div>
          ) : (
            <div className="categoryProgramsPage__grid">
              {programs.map((program) => (
                <article
                  className="categoryProgramsPage__card"
                  key={program.programId ?? program.programName}
                >
                  {/* Stretched link covers the entire card — whole card is clickable */}
                  {program.programId && (
                    <Link
                      className="categoryProgramsPage__cardLink"
                      to={`/guided/${categorySlug}/${program.programId}`}
                      aria-label={`View details for ${program.programName}`}
                    />
                  )}

                  <div className="categoryProgramsPage__media">
                    {program.imageUrl ? (
                      <img
                        className="categoryProgramsPage__image"
                        src={optimizeCloudinaryImageUrl(program.imageUrl, {
                          width: 640,
                          crop: "fill",
                        })}
                        srcSet={buildCloudinarySrcSet(
                          program.imageUrl,
                          [320, 480, 640, 800],
                          { crop: "fill" },
                        )}
                        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 340px"
                        alt={program.programName}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="categoryProgramsPage__fallback"
                        aria-hidden="true"
                      >
                        {program.programName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="categoryProgramsPage__body">
                    <h3 className="categoryProgramsPage__programName">
                      {program.programName}
                    </h3>
                    <p className="categoryProgramsPage__expert">
                      By <strong>{program.expertName}</strong>
                      {program.expertTitle && (
                        <span className="categoryProgramsPage__expertTitle">
                          {" "}
                          · {program.expertTitle}
                        </span>
                      )}
                    </p>
                    <p className="categoryProgramsPage__description">
                      {program.body}
                    </p>

                    {(program.programDurations ?? []).length > 0 && (
                      <div className="categoryProgramsPage__durations">
                        {(program.programDurations ?? []).map((d) => (
                          <span
                            className="categoryProgramsPage__durationChip"
                            key={d.durationId}
                          >
                            {d.durationLabel}
                            {d.durationPrice && (
                              <strong className="categoryProgramsPage__price">
                                {" "}
                                · {d.durationPrice}
                              </strong>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    <span
                      className="categoryProgramsPage__detailsLink"
                      aria-hidden="true"
                    >
                      View Details →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="categoryProgramsPage__footer" ref={footerRef}>
            <Link
              className="categoryProgramsPage__allLink"
              to="/all-guided-programs"
            >
              Browse all programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
