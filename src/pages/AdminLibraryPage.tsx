import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { usePageTitle } from "../usePageTitle";
import LibraryCategoriesTab from "./admin/library/LibraryCategoriesTab";
import LibraryVideosTab from "./admin/library/LibraryVideosTab";
import LibraryAnalyticsTab from "./admin/library/LibraryAnalyticsTab";
import LibraryPurchasesTab from "./admin/library/LibraryPurchasesTab";
import "./AdminDashboard.scss";

type LibraryAdminTab = "videos" | "categories" | "analytics" | "purchases";

const TABS: { id: LibraryAdminTab; label: string }[] = [
  { id: "videos", label: "Videos" },
  { id: "categories", label: "Categories" },
  { id: "analytics", label: "Analytics" },
  { id: "purchases", label: "Purchases" },
];

export default function AdminLibraryPage() {
  usePageTitle("Library Admin");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryAdminTab>("videos");

  return (
    <section className="page page--adminDashboard">
      <div className="adminContent">
        <nav className="adminTabs" role="tablist" aria-label="Library admin sections">
          <div className="adminTabs__greeting">
            <h1 className="adminTabs__title">Library Admin</h1>
            <p className="adminTabs__lead">
              {user ? `Welcome, ${user.firstName}` : "Manage the Wellness Library"}
            </p>
          </div>
          <Link
            to="/admin-dashboard"
            className="adminTabs__tab adminTabs__tab--link"
            style={{ marginBottom: 8 }}
          >
            ← Main Admin
          </Link>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`adminTabs__tab${activeTab === tab.id ? " adminTabs__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="adminMain">
          {activeTab === "videos" && <LibraryVideosTab />}
          {activeTab === "categories" && <LibraryCategoriesTab />}
          {activeTab === "analytics" && <LibraryAnalyticsTab />}
          {activeTab === "purchases" && <LibraryPurchasesTab />}
        </div>
      </div>
    </section>
  );
}
