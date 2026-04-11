import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DASHBOARD_TABS,
  dashboardTabFromSearchParams,
  type DashboardTabId,
} from "../nav/dashboardTabs";
import ProfileTab from "./user/ProfileTab";
import MyProgramsTab from "./user/MyProgramsTab";
import LibraryTab from "./user/LibraryTab";
import OrdersTab from "./user/OrdersTab";
import RefundsTab from "./user/RefundsTab";
import ScheduleTab from "./user/ScheduleTab";
import { usePageTitle } from "../usePageTitle";
import "./Dashboard.scss";

export default function Dashboard() {
  usePageTitle("My Dashboard");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTabId>(() =>
    dashboardTabFromSearchParams(searchParams),
  );

  useEffect(() => {
    setActiveTab(dashboardTabFromSearchParams(searchParams));
  }, [searchParams]);

  return (
    <section className="page page--dashboard">
      <div className="dashLayout">
        <nav className="dashSidebar" aria-label="Dashboard sections">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashSidebar__tab${activeTab === tab.id ? " dashSidebar__tab--active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id }, { replace: true });
              }}
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
