/**
 * Centralized date formatting and calculation utilities.
 */

/** Format an ISO date string to locale date (e.g. "3/26/2026") */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString();
}

/** Format an ISO date string to locale date + time (e.g. "3/26/2026, 2:30 PM") */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString();
}

/** Safely extract the date portion from an ISO string (replaces .split("T")[0]) */
export function parseISODate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return dateStr.split("T")[0] ?? "";
  }
}

/** Calculate end date given a start date and number of weeks */
export function calculateEndDate(startDate: string, weeks: number): Date {
  const start = new Date(startDate);
  return new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
}

/** Get today's date as ISO date string (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
