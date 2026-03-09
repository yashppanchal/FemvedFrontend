import "./CategoryProgramsPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import {
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
  const { country, isCountryReady } = useCountry();
  const [allCategories, setAllCategories] = useState<GuidedProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isCountryReady) return;

    let isActive = true;

    async function load() {
      setLoading(true);
      setHasError(false);
      try {
        const data = await loadGuidedPrograms(country);
        if (isActive) setAllCategories(data);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => { isActive = false; };
  }, [country, isCountryReady]);

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
      {/* Breadcrumb */}
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

      {/* ── Section 1: Category overview ─────────────────────────────────── */}
      <div className="categoryProgramsPage__intro">
        <div className="categoryProgramsPage__introText">
          <p className="categoryProgramsPage__eyebrow">Guided 1:1 Care</p>
          <h1 className="categoryProgramsPage__title">{category.programType}</h1>
          {category.heroSubtext && (
            <p className="categoryProgramsPage__subtext">{category.heroSubtext}</p>
          )}
        </div>

        {whatsIncluded.length > 0 && (
          <div className="categoryProgramsPage__included">
            <h2 className="categoryProgramsPage__sectionHeading">What's included in every program</h2>
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
      </div>

      {/* ── Section 2: Key areas ─────────────────────────────────────────── */}
      {keyAreas.length > 0 && (
        <div className="categoryProgramsPage__keyAreas">
          <h2 className="categoryProgramsPage__sectionHeading">
            Key areas where you can receive personalised support
          </h2>
          <ul className="categoryProgramsPage__keyAreasList">
            {keyAreas.map((area, i) => (
              <li key={i} className="categoryProgramsPage__keyAreaItem">
                <span className="categoryProgramsPage__keyAreaCheck" aria-hidden="true">✓</span>
                <span>{area.trim()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Programs grid ────────────────────────────────────────────────── */}
      <div className="categoryProgramsPage__programsHeader">
        <h2 className="categoryProgramsPage__programsTitle">
          Choose the program that's right for you
        </h2>
        <p className="categoryProgramsPage__count">
          {programs.length} {programs.length === 1 ? "program" : "programs"} available
        </p>
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
            <article className="categoryProgramsPage__card" key={program.programId ?? program.programName}>
              <div className="categoryProgramsPage__media">
                {program.imageUrl ? (
                  <img
                    className="categoryProgramsPage__image"
                    src={optimizeCloudinaryImageUrl(program.imageUrl, { width: 640, crop: "fill" })}
                    srcSet={buildCloudinarySrcSet(program.imageUrl, [320, 480, 640, 800], { crop: "fill" })}
                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 380px"
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

                {program.programId && (
                  <Link
                    className="categoryProgramsPage__detailsLink"
                    to={`/guided/${categorySlug}/${program.programId}`}
                  >
                    View Details →
                  </Link>
                )}
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
    </section>
  );
}
