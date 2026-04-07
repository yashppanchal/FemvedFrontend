import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ProfileTab from "./user/ProfileTab";
import MyProgramsTab from "./user/MyProgramsTab";
import LibraryTab from "./user/LibraryTab";
import OrdersTab from "./user/OrdersTab";
import RefundsTab from "./user/RefundsTab";
import ScheduleTab from "./user/ScheduleTab";
import { usePageTitle } from "../usePageTitle";
import "./Dashboard.scss";

type DashTab = "profile" | "programs" | "library" | "orders" | "refunds" | "schedule";

const TABS: { id: DashTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "programs", label: "My Programs" },
  { id: "library", label: "My Library" },
  { id: "schedule", label: "Schedule" },
  { id: "orders", label: "Orders" },
  { id: "refunds", label: "Refunds" },
];

function getInitialTab(params: URLSearchParams): DashTab {
  const tab = params.get("tab");
  if (tab && TABS.some((t) => t.id === tab)) return tab as DashTab;
  return "profile";
}

export default function Dashboard() {
  usePageTitle("My Dashboard");
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashTab>(() => getInitialTab(searchParams));

  return (
    <section className="page page--dashboard">
      <div className="dashLayout">
        <nav className="dashSidebar" aria-label="Dashboard sections">
          <div className="dashSidebar__greeting">
            <h1 className="dashSidebar__title">Dashboard</h1>
            <p className="dashSidebar__lead">
              Welcome back, {user?.firstName ?? "there"}
            </p>
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashSidebar__tab${activeTab === tab.id ? " dashSidebar__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="dashContent">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "programs" && <MyProgramsTab />}
          {activeTab === "library" && <LibraryTab />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "refunds" && <RefundsTab />}
        </div>
      </div>
    </section>
  );
}
