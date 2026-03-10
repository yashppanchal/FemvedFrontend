import "./CategoryProgramsPage.scss";
import { useEffect, useMemo, useState } from "react";
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
  const [allCategories, setAllCategories] = useState<GuidedProgramInfo[]>(
    () => getGuidedProgramsSnapshot(country) ?? [],
  );
  const [loading, setLoading] = useState(() => getGuidedProgramsSnapshot(country) === null);
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

    return () => { isActive = false; };
  }, [country]);

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
      <section className="page categoryProgramsPage">
        <p className="categoryProgramsPage__loading">Loading programs…</p>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page categoryProgramsPage">
        <h1 className="page__title">Unable to load programs</h1>
        <p className="page__lead">
          Please refresh and try again or go back <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  if (!category) {
    return (
      <section className="page categoryProgramsPage">
        <h1 className="page__title">Category not found</h1>
        <p className="page__lead">
          <Link to="/all-guided-programs">Browse all programs</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page categoryProgramsPage">
      {/* ── Two-panel layout ─────────────────────────────────────────────── */}
      <div className="categoryProgramsPage__layout">

        {/* ── Left sticky sidebar ───────────────────────────────────────── */}
        <aside className="categoryProgramsPage__sidebar">
          <div className="categoryProgramsPage__sidebarInner">
            {/* Breadcrumb lives inside the sidebar — visually anchored to the warm panel */}
            <nav className="categoryProgramsPage__breadcrumb" aria-label="Breadcrumb">
              <Link className="categoryProgramsPage__breadcrumbLink" to="/">Home</Link>
              <span className="categoryProgramsPage__breadcrumbSep" aria-hidden="true">›</span>
              <Link
                className="categoryProgramsPage__breadcrumbLink"
                to={`/guided/${categorySlug}`}
              >
                {category.programType || categorySlug}
              </Link>
              <span className="categoryProgramsPage__breadcrumbSep" aria-hidden="true">›</span>
              <span className="categoryProgramsPage__breadcrumbCurrent">Programs</span>
            </nav>

            <div className="categoryProgramsPage__sidebarHead">
              <p className="categoryProgramsPage__eyebrow">Guided 1:1 Care</p>
              <h1 className="categoryProgramsPage__title">{category.programType}</h1>
              {category.heroSubtext && (
                <p className="categoryProgramsPage__subtext">{category.heroSubtext}</p>
              )}
            </div>

            {whatsIncluded.length > 0 && (
              <div className="categoryProgramsPage__included">
                <h2 className="categoryProgramsPage__sectionHeading">What's included</h2>
                <ul className="categoryProgramsPage__includedList">
                  {whatsIncluded.map((item, i) => (
                    <li key={i} className="categoryProgramsPage__includedItem">
                      <span className="categoryProgramsPage__includedCheck" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {keyAreas.length > 0 && (
              <div className="categoryProgramsPage__keyAreas">
                <h2 className="categoryProgramsPage__sectionHeading">Key areas</h2>
                <div className="categoryProgramsPage__keyAreaChips">
                  {keyAreas.map((area, i) => (
                    <span key={i} className="categoryProgramsPage__keyAreaChip">
                      {area.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="categoryProgramsPage__sidebarMeta">
              <span className="categoryProgramsPage__programsBadge">
                {programs.length} {programs.length === 1 ? "program" : "programs"} available
              </span>
            </div>
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
                        src={optimizeCloudinaryImageUrl(program.imageUrl, { width: 640, crop: "fill" })}
                        srcSet={buildCloudinarySrcSet(program.imageUrl, [320, 480, 640, 800], { crop: "fill" })}
                        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 340px"
                        alt={program.programName}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="categoryProgramsPage__fallback" aria-hidden="true">
                        {program.programName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="categoryProgramsPage__body">
                    <h3 className="categoryProgramsPage__programName">{program.programName}</h3>
                    <p className="categoryProgramsPage__expert">
                      By <strong>{program.expertName}</strong>
                      {program.expertTitle && (
                        <span className="categoryProgramsPage__expertTitle">
                          {" "}· {program.expertTitle}
                        </span>
                      )}
                    </p>
                    <p className="categoryProgramsPage__description">{program.body}</p>

                    {(program.programDurations ?? []).length > 0 && (
                      <div className="categoryProgramsPage__durations">
                        {(program.programDurations ?? []).map((d) => (
                          <span className="categoryProgramsPage__durationChip" key={d.durationId}>
                            {d.durationLabel}
                            {d.durationPrice && (
                              <strong className="categoryProgramsPage__price"> · {d.durationPrice}</strong>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="categoryProgramsPage__detailsLink" aria-hidden="true">
                      View Details →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="categoryProgramsPage__footer">
            <Link className="categoryProgramsPage__backLink" to={`/guided/${categorySlug}`}>
              ← Back to {category.programType}
            </Link>
            <Link className="categoryProgramsPage__allLink" to="/all-guided-programs">
              Browse all programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
