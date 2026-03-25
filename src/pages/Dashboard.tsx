import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import ProfileTab from "./user/ProfileTab";
import MyProgramsTab from "./user/MyProgramsTab";
import OrdersTab from "./user/OrdersTab";
import RefundsTab from "./user/RefundsTab";
import "./Dashboard.scss";

type DashTab = "profile" | "programs" | "orders" | "refunds";

const TABS: { id: DashTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "programs", label: "My Programs" },
  { id: "orders", label: "Orders" },
  { id: "refunds", label: "Refunds" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>("profile");

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
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "refunds" && <RefundsTab />}
        </div>
      </div>
    </section>
  );
}
