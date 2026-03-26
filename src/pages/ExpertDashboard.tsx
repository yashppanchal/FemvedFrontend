import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import ExpertProfileTab from "./expert/ExpertProfileTab";
import ExpertProgramsTab from "./expert/ExpertProgramsTab";
import ExpertEnrollmentsTab from "./expert/ExpertEnrollmentsTab";
import ExpertEarningsTab from "./expert/ExpertEarningsTab";
import ExpertCreateProgramTab from "./expert/ExpertCreateProgramTab";
import { usePageTitle } from "../usePageTitle";
import "./ExpertDashboard.scss";

const ENABLE_CREATE_PROGRAM = import.meta.env.VITE_ENABLE_CREATE_PROGRAM !== "false";

type ExpertTab = "profile" | "programs" | "enrollments" | "earnings" | "create";

const ALL_TABS: { id: ExpertTab; label: string; hidden?: boolean }[] = [
  { id: "profile", label: "Profile" },
  { id: "programs", label: "My Programs" },
  { id: "enrollments", label: "Enrollments" },
  { id: "earnings", label: "Earnings" },
  { id: "create", label: "Create Program", hidden: !ENABLE_CREATE_PROGRAM },
];

const TABS = ALL_TABS.filter((t) => !t.hidden);

export default function ExpertDashboard() {
  usePageTitle("Expert Dashboard");
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
      <div className="expertLayout">
        <nav className="expertSidebar" aria-label="Expert dashboard sections">
          <div className="expertSidebar__greeting">
            <h1 className="expertSidebar__title">Expert Dashboard</h1>
            <p className="expertSidebar__lead">
              Welcome, {user?.firstName ?? "Expert"}
            </p>
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`expertSidebar__tab${activeTab === tab.id ? " expertSidebar__tab--active" : ""}`}
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
      </div>
    </section>
  );
}
