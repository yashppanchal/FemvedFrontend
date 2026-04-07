import { apiFetch } from "./client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UpdateExpertProfileRequest {
  displayName: string;
  title: string;
  bio: string;
  gridDescription: string;
  detailedDescription: string;
  profileImageUrl: string | null;
  gridImageUrl: string | null;
  specialisations: string[];
  yearsExperience: number | null;
  credentials: string[];
  locationCountry: string | null;
  isActive: boolean;
}

export interface ExpertProfileResponse {
  expertId: string;
  userId: string;
  displayName: string;
  title: string;
  bio: string;
  gridDescription: string | null;
  detailedDescription: string | null;
  profileImageUrl: string | null;
  gridImageUrl: string | null;
  specialisations: string[] | null;
  yearsExperience: number | null;
  credentials: string[] | null;
  locationCountry: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ExpertProgram {
  programId: string;
  name: string;
  slug: string;
  status: string;
  gridImageUrl: string | null;
  totalEnrollments: number;
  activeEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentComment {
  commentId: string;
  accessId: string;
  expertId: string;
  updateNote: string;
  createdAt: string;
}

export interface PostCommentResponse {
  accessId: string;
  sent: boolean;
}

export interface EarningsCurrencyAmount {
  currencyCode: string;
  currencySymbol: string;
  amount: number;
}

export interface ExpertEarningsBalance {
  expertId: string;
  expertName: string;
  commissionRate: number;
  totalEarned: EarningsCurrencyAmount[];
  expertShare: EarningsCurrencyAmount[];
  platformCommission: EarningsCurrencyAmount[];
  totalPaid: EarningsCurrencyAmount[];
  outstandingBalance: EarningsCurrencyAmount[];
  lastPayoutAt: string | null;
}

export interface ExpertPayoutRecord {
  payoutId: string;
  expertId: string;
  expertName: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  paymentReference: string | null;
  notes: string | null;
  paidByName: string;
  paidAt: string;
  createdAt: string;
}

export interface ExpertEnrollment {
  accessId: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  programId: string;
  programName: string;
  durationLabel: string;
  durationWeeks: number;
  accessStatus: string;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  scheduledStartAt: string | null;
  endDate: string | null;
  requestedStartDate: string | null;
  startRequestStatus: string | null;
  enrolledAt: string;
}

/* ------------------------------------------------------------------ */
/*  Profile endpoints                                                  */
/* ------------------------------------------------------------------ */

export function fetchCurrentExpertProfile(): Promise<ExpertProfileResponse> {
  return apiFetch<ExpertProfileResponse>("/experts/me");
}

export function updateExpertProfile(
  data: UpdateExpertProfileRequest,
): Promise<ExpertProfileResponse> {
  return apiFetch<ExpertProfileResponse>("/experts/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ------------------------------------------------------------------ */
/*  Programs                                                           */
/* ------------------------------------------------------------------ */

export function getExpertPrograms(): Promise<ExpertProgram[]> {
  return apiFetch<ExpertProgram[]>("/experts/me/programs");
}

/* ------------------------------------------------------------------ */
/*  Enrollments                                                        */
/* ------------------------------------------------------------------ */

export function getExpertEnrollments(): Promise<ExpertEnrollment[]> {
  return apiFetch<ExpertEnrollment[]>("/experts/me/enrollments");
}

export function startEnrollment(accessId: string, scheduledDate?: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/start`, {
    method: "POST",
    body: JSON.stringify(scheduledDate ? { scheduledDate } : {}),
  });
}

export function pauseExpertEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/pause`, { method: "POST" });
}

export function resumeEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/resume`, { method: "POST" });
}

export function endExpertEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/end`, { method: "POST" });
}

export function approveStartDate(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/approve-start`, { method: "POST" });
}

export function declineStartDate(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/decline-start`, { method: "POST" });
}

export function getEnrollmentComments(accessId: string): Promise<EnrollmentComment[]> {
  return apiFetch<EnrollmentComment[]>(`/experts/me/enrollments/${accessId}/comments`);
}

export function postEnrollmentComment(
  accessId: string,
  updateNote: string,
): Promise<PostCommentResponse> {
  return apiFetch<PostCommentResponse>(`/experts/me/enrollments/${accessId}/comments`, {
    method: "POST",
    body: JSON.stringify({ updateNote }),
  });
}

/* ------------------------------------------------------------------ */
/*  Earnings & Payouts                                                 */
/* ------------------------------------------------------------------ */

export function getExpertEarnings(): Promise<ExpertEarningsBalance> {
  return apiFetch<ExpertEarningsBalance>("/experts/me/earnings");
}

export function getExpertPayoutHistory(): Promise<ExpertPayoutRecord[]> {
  return apiFetch<ExpertPayoutRecord[]>("/experts/me/payouts");
}

/* ------------------------------------------------------------------ */
/*  Library Sales                                                       */
/* ------------------------------------------------------------------ */

export interface ExpertLibrarySalesResponse {
  totalVideos: number;
  totalPurchases: number;
  videos: ExpertLibraryVideoSalesDto[];
  revenueByurrency: ExpertLibrarySalesCurrencyDto[];
}

export interface ExpertLibraryVideoSalesDto {
  videoId: string;
  title: string;
  videoType: string;
  status: string;
  purchaseCount: number;
  createdAt: string;
}

export interface ExpertLibrarySalesCurrencyDto {
  currencyCode: string;
  currencySymbol: string;
  totalRevenue: number;
  orderCount: number;
}

export function getExpertLibrarySales(): Promise<ExpertLibrarySalesResponse> {
  return apiFetch<ExpertLibrarySalesResponse>("/experts/me/library-sales");
}
