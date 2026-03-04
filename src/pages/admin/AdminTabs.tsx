import type { AdminTab } from "./types";

type AdminTabsProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
};

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="adminTabs" role="tablist" aria-label="Admin dashboard sections">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "users"}
        className={`adminTabs__tab ${activeTab === "users" ? "adminTabs__tab--active" : ""}`}
        onClick={() => onTabChange("users")}
      >
        Users
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "domains"}
        className={`adminTabs__tab ${activeTab === "domains" ? "adminTabs__tab--active" : ""}`}
        onClick={() => onTabChange("domains")}
      >
        Domains
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "categories"}
        className={`adminTabs__tab ${activeTab === "categories" ? "adminTabs__tab--active" : ""}`}
        onClick={() => onTabChange("categories")}
      >
        Categories
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "programs"}
        className={`adminTabs__tab ${activeTab === "programs" ? "adminTabs__tab--active" : ""}`}
        onClick={() => onTabChange("programs")}
      >
        Programs
      </button>
    </div>
  );
}
