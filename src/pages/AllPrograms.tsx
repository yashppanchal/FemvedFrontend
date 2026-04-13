import "./AllPrograms.scss";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import { LoadingScreen } from "../components/LoadingScreen";
import { getGuidedProgramsSnapshot, loadGuidedPrograms, normalizeSlug, type GuidedProgramInfo } from "../data/guidedPrograms";
import { buildProgramUrl } from "../config/programUrlMode";

type ParsedPrice = {
  currency: string;
  value: number | null;
};

type FlattenedProgram = {
  id: string;
  programSlug: string;
  name: string;
  expertName: string;
  body: string;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
  categoryType: string;
  durations: Array<{
    label: string;
    price: string;
    parsed: ParsedPrice;
  }>;
};

function parseDurationPrice(rawPrice: string): ParsedPrice {
  const trimmed = rawPrice.trim();
  if (!trimmed) return { currency: "Unknown", value: null };

  const currencyMatch = trimmed.match(/^([^\d.,]+)/);
  const numericMatch = trimmed.match(/[\d,]+(?:\.\d+)?/);
  const currency = currencyMatch?.[1]?.trim() || "Unknown";
  const value = numericMatch ? Number.parseFloat(numericMatch[0].replace(/,/g, "")) : null;

  return { currency, value: Number.isFinite(value) ? value : null };
}

function normalizeText(value: string) {
  return value.trim() || "Unknown";
}

function flattenCategories(categories: GuidedProgramInfo[]): FlattenedProgram[] {
  const flattened: FlattenedProgram[] = [];
  for (const category of categories) {
    const categoryName = normalizeText(category.slug ?? category.programType);
    const categorySlug = normalizeSlug(category.slug);
    const categoryType = normalizeText(category.programType);
    for (const program of category.programsInCategory ?? []) {
      const durationRows = (program.programDurations ?? []).map((d) => ({
        label: normalizeText(d.durationLabel),
        price: normalizeText(d.durationPrice),
        parsed: parseDurationPrice(d.durationPrice),
      }));
      flattened.push({
        id: program.programId || `${categorySlug}-${normalizeSlug(program.programName)}`,
        programSlug: program.programSlug ?? "",
        name: normalizeText(program.programName),
        expertName: normalizeText(program.expertName),
        body: program.body.trim(),
        imageUrl: program.imageUrl?.trim() ?? "",
        categoryName,
        categorySlug,
        categoryType,
        durations: durationRows,
      });
    }
  }
  return flattened;
}

export default function AllPrograms() {
  const { country } = useCountry();
  const filterPanelId = "all-programs-filters";
  // Initialise from snapshot synchronously — no spinner flash on return visits
  const [programs, setPrograms] = useState<FlattenedProgram[]>(() => {
    const snapshot = getGuidedProgramsSnapshot(country);
    return snapshot ? flattenCategories(snapshot) : [];
  });
  const [loading, setLoading] = useState(() => getGuidedProgramsSnapshot(country) === null);
  const [hasError, setHasError] = useState(false);

  const [selectedCategoryType, setSelectedCategoryType] = useState("all");
  const [selectedExpert, setSelectedExpert] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [isCompactFiltersView, setIsCompactFiltersView] = useState(false);
  const [areFiltersOpen, setAreFiltersOpen] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1100px)");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsCompactFiltersView(event.matches);
      setAreFiltersOpen(event.matches ? false : true);
    };

    setIsCompactFiltersView(mediaQuery.matches);
    setAreFiltersOpen(mediaQuery.matches ? false : true);

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    setHasError(false);

    // Show any cached data for this country immediately (stale is fine to start)
    const snapshot = getGuidedProgramsSnapshot(country);
    if (snapshot) {
      setPrograms(flattenCategories(snapshot));
      setLoading(false);
    } else {
      setPrograms([]);
      setLoading(true);
    }

    // Load fresh/background-refreshed data (returns fast from cache, or fetches)
    loadGuidedPrograms(country)
      .then((categories) => {
        if (isActive) {
          setPrograms(flattenCategories(categories));
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

  const categoryTypes = useMemo(
    () => Array.from(new Set(programs.map((program) => program.categoryType))).sort(),
    [programs],
  );

  const expertOptions = useMemo(
    () => Array.from(new Set(programs.map((program) => program.expertName))).sort(),
    [programs],
  );

  const durationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          programs.flatMap((program) => program.durations.map((duration) => duration.label)),
        ),
      ).sort(),
    [programs],
  );

  const filteredPrograms = useMemo(() => {
    const minPrice = minPriceInput.trim() ? Number(minPriceInput) : null;
    const maxPrice = maxPriceInput.trim() ? Number(maxPriceInput) : null;

    return programs.filter((program) => {
      const categoryMatch =
        selectedCategoryType === "all" || program.categoryType === selectedCategoryType;

      const expertMatch = selectedExpert === "all" || program.expertName === selectedExpert;

      const durationMatch =
        selectedDuration === "all" ||
        program.durations.some((duration) => duration.label === selectedDuration);

      const priceMatch = program.durations.some((duration) => {
        const amount = duration.parsed.value;
        if (amount === null) return false;
        if (minPrice !== null && Number.isFinite(minPrice) && amount < minPrice) return false;
        if (maxPrice !== null && Number.isFinite(maxPrice) && amount > maxPrice) return false;
        return true;
      });

      const hasPriceFilter = minPrice !== null || maxPrice !== null;
      return categoryMatch && expertMatch && durationMatch && (hasPriceFilter ? priceMatch : true);
    });
  }, [
    maxPriceInput,
    minPriceInput,
    programs,
    selectedCategoryType,
    selectedExpert,
    selectedDuration,
  ]);

  const hasAnyFilter =
    selectedCategoryType !== "all" ||
    selectedExpert !== "all" ||
    selectedDuration !== "all" ||
    minPriceInput.trim() !== "" ||
    maxPriceInput.trim() !== "";

  if (loading) {
    return (
      <section className="page allProgramsPage">
        <LoadingScreen message="Loading all guided programs…" />
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page allProgramsPage">
        <h1 className="page__title">Unable to load all guided programs</h1>
        <p className="page__lead">
          Please refresh and try again. You can also go back <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page allProgramsPage">
      <header className="allProgramsPage__header">
        <h1 className="page__title">All Guided 1:1 Care Programs</h1>
        <p className="page__lead">
          Explore every program across all guided care categories and filter by your preferences.
        </p>
      </header>

      <div className="allProgramsPage__filtersWrap">
        {isCompactFiltersView ? (
          <button
            type="button"
            className="button allProgramsPage__filtersToggle"
            aria-expanded={areFiltersOpen}
            aria-controls={filterPanelId}
            onClick={() => setAreFiltersOpen((currentValue) => !currentValue)}
          >
            {areFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        ) : null}

        {(!isCompactFiltersView || areFiltersOpen) && (
          <div className="allProgramsPage__filters card" id={filterPanelId}>
            <div className="field">
              <label className="field__label" htmlFor="categoryType">
                Category Type
              </label>
              <select
                id="categoryType"
                className="field__input allProgramsPage__select"
                value={selectedCategoryType}
                onChange={(event) => setSelectedCategoryType(event.target.value)}
              >
                <option value="all">All category types</option>
                {categoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="expert">
                Expert
              </label>
              <select
                id="expert"
                className="field__input allProgramsPage__select"
                value={selectedExpert}
                onChange={(event) => setSelectedExpert(event.target.value)}
              >
                <option value="all">All experts</option>
                {expertOptions.map((expert) => (
                  <option key={expert} value={expert}>
                    {expert}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="duration">
                Duration
              </label>
              <select
                id="duration"
                className="field__input allProgramsPage__select"
                value={selectedDuration}
                onChange={(event) => setSelectedDuration(event.target.value)}
              >
                <option value="all">All durations</option>
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="minPrice">
                Min Price
              </label>
              <input
                id="minPrice"
                className="field__input"
                type="number"
                min="0"
                inputMode="numeric"
                value={minPriceInput}
                onChange={(event) => setMinPriceInput(event.target.value)}
                placeholder="e.g. 3000"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="maxPrice">
                Max Price
              </label>
              <input
                id="maxPrice"
                className="field__input"
                type="number"
                min="0"
                inputMode="numeric"
                value={maxPriceInput}
                onChange={(event) => setMaxPriceInput(event.target.value)}
                placeholder="e.g. 12000"
              />
            </div>

            <div className="allProgramsPage__filterActions">
              <button
                type="button"
                className="button allProgramsPage__clearBtn"
                onClick={() => {
                  setSelectedCategoryType("all");
                  setSelectedExpert("all");
                  setSelectedDuration("all");
                  setMinPriceInput("");
                  setMaxPriceInput("");
                }}
                disabled={!hasAnyFilter}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="allProgramsPage__resultsCount">
        Showing {filteredPrograms.length} of {programs.length} programs
      </p>

      {filteredPrograms.length ? (
        <div className="allProgramsPage__grid">
          {filteredPrograms.map((program) => (
            <article className="allProgramsPage__card" key={program.id}>
              <div className="allProgramsPage__media">
                {program.imageUrl ? (
                  <img src={program.imageUrl} alt={program.name} loading="lazy" />
                ) : (
                  <div className="allProgramsPage__fallbackMedia" aria-hidden="true">
                    {program.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="allProgramsPage__body">
                <p className="allProgramsPage__badge">{program.categoryType}</p>
                <h2 className="allProgramsPage__title">{program.name}</h2>
                <p className="allProgramsPage__expert">
                  By <strong>{program.expertName}</strong>
                </p>
                <p className="allProgramsPage__description">{program.body}</p>

                {program.durations.length ? (
                  <div className="allProgramsPage__chips">
                    {program.durations.slice(0, 3).map((duration) => (
                      <span className="allProgramsPage__chip" key={`${program.id}-${duration.label}`}>
                        {duration.label} - {duration.price}
                      </span>
                    ))}
                  </div>
                ) : null}

                <Link
                  className="allProgramsPage__detailsLink"
                  to={buildProgramUrl(program.categorySlug, program.programSlug, program.id)}
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card allProgramsPage__emptyState">
          <h2 className="card__title">No programs match these filters</h2>
          <p className="card__text">Try clearing one or more filters to see available options.</p>
        </div>
      )}
    </section>
  );
}
