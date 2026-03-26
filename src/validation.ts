/**
 * Shared form validation helpers.
 */

/** Check if a string is a valid URL */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/** Check if a rating value is between 1 and 5 */
export function isValidRating(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 5;
}

/** Check that startDate is not after endDate */
export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) return true;
  return new Date(start) <= new Date(end);
}

/** Check that a price is non-negative */
export function isNonNegativePrice(value: string | number): boolean {
  const num = typeof value === "string" ? Number(value) : value;
  return !Number.isNaN(num) && num >= 0;
}
