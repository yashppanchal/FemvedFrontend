import "./FilterTabs.scss";
import type { LibraryFilterDto } from "../../api/library";

interface FilterTabsProps {
  filters: LibraryFilterDto[];
  activeKey: string;
  onSelect: (filterKey: string) => void;
}

export default function FilterTabs({ filters, activeKey, onSelect }: FilterTabsProps) {
  if (filters.length === 0) return null;

  return (
    <nav className="filterTabs" aria-label="Library filters">
      <ul className="filterTabs__list" role="tablist">
        {filters.map((filter) => {
          const isActive = filter.filterKey === activeKey;
          return (
            <li key={filter.filterId} role="presentation">
              <button
                type="button"
                role="tab"
                className={`filterTabs__tab${isActive ? " filterTabs__tab--active" : ""}`}
                aria-selected={isActive}
                onClick={() => onSelect(filter.filterKey)}
              >
                {filter.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
