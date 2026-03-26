/**
 * Maps a status string from the API to a CSS badge class suffix.
 * Usage: `statusBadge statusBadge--${getStatusBadgeClass(status)}`
 */
export function getStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase().replace(/[\s_]/g, "");
  switch (s) {
    case "active":
    case "published":
      return "active";
    case "paid":
    case "completed":
      return "paid";
    case "pending":
    case "pendingreview":
    case "processing":
      return "scheduled";
    case "draft":
    case "notstarted":
    case "inactive":
      return "notstarted";
    case "scheduled":
      return "scheduled";
    case "paused":
      return "paused";
    case "archived":
    case "ended":
    case "refunded":
    case "cancelled":
    case "failed":
    case "deleted":
      return "ended";
    default:
      return "notstarted";
  }
}

/**
 * Formats a raw status string for display.
 * e.g. "PendingReview" → "Pending Review", "notstarted" → "Not Started"
 */
export function formatStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  // Insert space before uppercase letters, then title-case
  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
