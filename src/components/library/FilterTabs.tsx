import "./FilterTabs.scss";
import type { LibraryCategoryDto } from "../../api/library";

const VIDEO_TYPES = [
  { key: "all", label: "All" },
  { key: "MASTERCLASS", label: "Masterclass" },
  { key: "SERIES", label: "Series" },
];

interface FilterTabsProps {
  categories: LibraryCategoryDto[];
  activeCategory: string;
  activeType: string;
  onCategoryChange: (key: string) => void;
  onTypeChange: (key: string) => void;
  onClearFilters: () => void;
}

export default function FilterTabs({
  categories,
  activeCategory,
  activeType,
  onCategoryChange,
  onTypeChange,
  onClearFilters,
}: FilterTabsProps) {
  const hasActiveFilters = activeCategory !== "all" || activeType !== "all";

  return (
    <section className="libraryFilters" aria-labelledby="libraryFiltersTitle">
      <div className="libraryFilters__inner">
        <div className="libraryFilters__header">
          <div>
            <h2 className="libraryFilters__title" id="libraryFiltersTitle">
              Explore by category
            </h2>
            <p className="libraryFilters__subtitle">
              Honor where you are. Start with the beginner's masterclass or
              embrace a deeper transformation with our recorded course by
              experts.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              className="libraryFilters__clear"
              onClick={onClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="libraryFilters__row">
          <div className="libraryFilters__group libraryFilters__group--topic">
            <p
              className="libraryFilters__label"
              id="libraryFilters-topic-label"
            >
              Topic
            </p>
            <div
              className="libraryFilters__topicWrap"
              role="radiogroup"
              aria-labelledby="libraryFilters-topic-label"
            >
              <ul className="libraryFilters__chips">
                <li>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={activeCategory === "all"}
                    className={`libraryFilters__chip${activeCategory === "all" ? " libraryFilters__chip--active" : ""}`}
                    onClick={() => onCategoryChange("all")}
                  >
                    All topics
                  </button>
                </li>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.categorySlug;
                  return (
                    <li key={cat.categoryId}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={`libraryFilters__chip${isActive ? " libraryFilters__chip--active" : ""}`}
                        onClick={() => onCategoryChange(cat.categorySlug)}
                      >
                        {cat.categoryName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="libraryFilters__group libraryFilters__group--format">
            <p
              className="libraryFilters__label"
              id="libraryFilters-format-label"
            >
              Format
            </p>
            <div
              className="libraryFilters__segment"
              role="radiogroup"
              aria-labelledby="libraryFilters-format-label"
            >
              {VIDEO_TYPES.map((t, index) => {
                const isActive = activeType === t.key;
                const pos =
                  index === 0
                    ? "first"
                    : index === VIDEO_TYPES.length - 1
                      ? "last"
                      : "mid";
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`libraryFilters__segmentBtn libraryFilters__segmentBtn--${pos}${isActive ? " libraryFilters__segmentBtn--active" : ""}`}
                    onClick={() => onTypeChange(t.key)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
