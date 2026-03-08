import type { AdminTab } from "./types";

type AdminTabsProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
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
  { id: "gdpr", label: "GDPR" },
  { id: "auditlog", label: "Audit Log" },
  { id: "payouts", label: "Payouts" },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="adminTabs" role="tablist" aria-label="Admin dashboard sections">
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
    </div>
  );
}
