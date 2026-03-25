import type { AdminTab } from "./types";

type AdminTabsProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  userName?: string;
};

const TABS: { id: AdminTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "users", label: "Users" },
  { id: "experts", label: "Experts" },
  { id: "domains", label: "Domains" },
  { id: "categories", label: "Categories" },
  { id: "programs", label: "Programs" },
  { id: "coupons", label: "Coupons" },
  { id: "orders", label: "Orders" },
  { id: "enrollments", label: "Enrollments" },
  { id: "analytics", label: "Analytics" },
  { id: "gdpr", label: "Data Requests" },
  { id: "payouts", label: "Payouts" },
];

export function AdminTabs({ activeTab, onTabChange, userName }: AdminTabsProps) {
  return (
    <nav className="adminTabs" role="tablist" aria-label="Admin dashboard sections">
      <div className="adminTabs__greeting">
        <h1 className="adminTabs__title">Admin Dashboard</h1>
        <p className="adminTabs__lead">
          {userName ? `Welcome, ${userName}` : "Manage your platform"}
        </p>
      </div>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`adminTabs__tab${activeTab === tab.id ? " adminTabs__tab--active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
