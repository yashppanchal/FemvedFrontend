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
  profileImageUrl: string;
  gridImageUrl: string;
  specialisations: string[];
  yearsExperience: number;
  credentials: string[];
  locationCountry: string;
  isActive: boolean;
}

export interface ExpertProfileResponse {
  expertId: string;
  userId: string;
  displayName: string;
  title: string;
  bio: string;
  gridDescription: string;
  detailedDescription: string;
  profileImageUrl: string;
  gridImageUrl: string;
  specialisations: string[];
  yearsExperience: number;
  credentials: string[];
  locationCountry: string;
  isActive: boolean;
  createdAt: string;
}

export interface ExpertProgram {
  programId: string;
  programName: string;
  description: string;
  status: string;
  totalEnrollments: number;
  activeEnrollments: number;
  createdAt: string;
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
  accessStatus: string;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
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

export function startEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/experts/me/enrollments/${accessId}/start`, { method: "POST" });
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
