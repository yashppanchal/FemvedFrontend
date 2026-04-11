export type DashboardTabId =
  | "profile"
  | "programs"
  | "library"
  | "orders"
  | "refunds"
  | "schedule";

export const DASHBOARD_TABS: { id: DashboardTabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "programs", label: "My Programs" },
  { id: "library", label: "My Library" },
  { id: "schedule", label: "Schedule" },
  { id: "orders", label: "Orders" },
  { id: "refunds", label: "Refunds" },
];

export function dashboardTabFromSearchParams(
  params: URLSearchParams,
): DashboardTabId {
  const tab = params.get("tab");
  if (tab && DASHBOARD_TABS.some((t) => t.id === tab)) {
    return tab as DashboardTabId;
  }
  return "profile";
}
