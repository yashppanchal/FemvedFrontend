import { apiFetch } from "./client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  countryCode: string;
  role: string;
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface MyProgramAccess {
  accessId: string;
  programId: string;
  programName: string;
  expertName: string;
  // sometimes backend may return null/undefined when status is not yet set
  accessStatus?: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  purchasedAt: string | null;
  durationLabel: string;
}

export interface MyOrder {
  orderId: string;
  programId: string;
  programName: string;
  durationLabel: string;
  amount: number;
  currency: string;
  couponCode: string | null;
  discountAmount: number;
  status: string;
  createdAt: string;
}

export interface MyRefund {
  refundId: string;
  orderId: string;
  programName: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Endpoints                                                          */
/* ------------------------------------------------------------------ */

export function getMyProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/users/me");
}

export function updateMyProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
  return apiFetch<UserProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getMyProgramAccess(): Promise<MyProgramAccess[]> {
  return apiFetch<MyProgramAccess[]>("/users/me/program-access");
}

export function getMyOrders(): Promise<MyOrder[]> {
  return apiFetch<MyOrder[]>("/orders/my");
}

export function getMyRefunds(): Promise<MyRefund[]> {
  return apiFetch<MyRefund[]>("/refunds/my");
}

export function pauseMyEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/users/me/enrollments/${accessId}/pause`, { method: "POST" });
}

export function endMyEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>(`/users/me/enrollments/${accessId}/end`, { method: "POST" });
}

export function requestGdprDeletion(): Promise<void> {
  return apiFetch<void>("/users/me/gdpr-deletion-request", { method: "POST" });
}
