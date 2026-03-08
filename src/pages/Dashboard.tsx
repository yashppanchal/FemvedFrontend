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
      <h1 className="page__title">Dashboard</h1>
      <p className="page__lead">
        Welcome back, {user?.firstName ?? "there"}.
      </p>

      <nav className="dashTabs" aria-label="Dashboard sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dashTabs__btn${activeTab === tab.id ? " dashTabs__btn--active" : ""}`}
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
    </section>
  );
}
