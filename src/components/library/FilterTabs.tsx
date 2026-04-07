import "./FilterTabs.scss";
import type { LibraryCategoryDto } from "../../api/library";

const VIDEO_TYPES = [
  { key: "all", label: "All Types" },
  { key: "MASTERCLASS", label: "Masterclasses" },
  { key: "SERIES", label: "Series" },
];

interface FilterTabsProps {
  categories: LibraryCategoryDto[];
  activeCategory: string;
  activeType: string;
  onCategoryChange: (key: string) => void;
  onTypeChange: (key: string) => void;
}

export default function FilterTabs({
  categories,
  activeCategory,
  activeType,
  onCategoryChange,
  onTypeChange,
}: FilterTabsProps) {
  return (
    <div className="filterBar">
      <nav className="filterTabs" aria-label="Category filters">
        <ul className="filterTabs__list" role="tablist">
          <li role="presentation">
            <button
              type="button"
              role="tab"
              className={`filterTabs__tab${activeCategory === "all" ? " filterTabs__tab--active" : ""}`}
              aria-selected={activeCategory === "all"}
              onClick={() => onCategoryChange("all")}
            >
              All
            </button>
          </li>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.categorySlug;
            return (
              <li key={cat.categoryId} role="presentation">
                <button
                  type="button"
                  role="tab"
                  className={`filterTabs__tab${isActive ? " filterTabs__tab--active" : ""}`}
                  aria-selected={isActive}
                  onClick={() => onCategoryChange(cat.categorySlug)}
                >
                  {cat.categoryName}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="filterTabs" aria-label="Type filters">
        <ul className="filterTabs__list" role="tablist">
          {VIDEO_TYPES.map((t) => {
            const isActive = activeType === t.key;
            return (
              <li key={t.key} role="presentation">
                <button
                  type="button"
                  role="tab"
                  className={`filterTabs__tab${isActive ? " filterTabs__tab--active" : ""}`}
                  aria-selected={isActive}
                  onClick={() => onTypeChange(t.key)}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
