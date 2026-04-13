export const PROGRAM_URL_MODE =
  (import.meta.env.VITE_PROGRAM_URL_MODE ?? "uuid") as "slug" | "uuid";

export function buildProgramUrl(
  categorySlug: string,
  programSlug: string,
  programId: string,
): string {
  const segment = PROGRAM_URL_MODE === "slug" ? programSlug : programId;
  return `/guided/${categorySlug}/${segment}`;
}
