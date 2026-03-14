import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import ExpertProfileTab from "./expert/ExpertProfileTab";
import ExpertProgramsTab from "./expert/ExpertProgramsTab";
import ExpertEnrollmentsTab from "./expert/ExpertEnrollmentsTab";
import ExpertEarningsTab from "./expert/ExpertEarningsTab";
import ExpertCreateProgramTab from "./expert/ExpertCreateProgramTab";
import "./ExpertDashboard.scss";

type ExpertTab = "profile" | "programs" | "enrollments" | "earnings" | "create";

const TABS: { id: ExpertTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "programs", label: "My Programs" },
  { id: "enrollments", label: "Enrollments" },
  { id: "earnings", label: "Earnings" },
  { id: "create", label: "Create Program" },
];

export default function ExpertDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ExpertTab>("profile");
  const [filterProgramId, setFilterProgramId] = useState<string | null>(null);
  const [filterProgramName, setFilterProgramName] = useState<string | null>(null);

  const handleViewEnrollments = (programId: string, programName: string) => {
    setFilterProgramId(programId);
    setFilterProgramName(programName);
    setActiveTab("enrollments");
  };

  const handleTabChange = (tab: ExpertTab) => {
    if (tab !== "enrollments") {
      setFilterProgramId(null);
      setFilterProgramName(null);
    }
    setActiveTab(tab);
  };

  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">Expert Dashboard</h1>
      <p className="page__lead">
        Welcome, {user?.firstName ?? "Expert"}. Manage your profile, programs, and clients.
      </p>

      <nav className="expertTabs" aria-label="Expert dashboard sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`expertTabs__btn${activeTab === tab.id ? " expertTabs__btn--active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="expertContent">
        {activeTab === "profile" && <ExpertProfileTab />}
        {activeTab === "programs" && <ExpertProgramsTab onViewEnrollments={handleViewEnrollments} />}
        {activeTab === "enrollments" && (
          <ExpertEnrollmentsTab
            filterProgramId={filterProgramId}
            filterProgramName={filterProgramName}
            onClearFilter={() => { setFilterProgramId(null); setFilterProgramName(null); }}
          />
        )}
        {activeTab === "earnings" && <ExpertEarningsTab />}
        {activeTab === "create" && <ExpertCreateProgramTab />}
      </div>
    </section>
  );
}
