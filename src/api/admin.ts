import { apiFetch } from './client';

export interface AdminSummary {
  totalUsers: number;
  totalExperts: number;
  totalPrograms: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface AdminUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  countryCode: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminExpert {
  expertId: string;
  userId: string;
  displayName: string;
  title: string;
  userEmail: string;
  isActive: boolean;
  locationCountry: string;
  createdAt: string;
}

export interface AdminCoupon {
  couponId: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  minOrderAmount: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponRequest {
  code: string;
  discountType: string;
  discountValue: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  minOrderAmount?: number;
}

export interface AdminOrder {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  programId: string;
  programName: string;
  durationLabel: string;
  amount: number;
  currency: string;
  couponCode: string | null;
  discountAmount: number;
  status: string;
  gateway: string;
  createdAt: string;
}

export interface AdminEnrollment {
  accessId: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  expertId: string;
  expertName: string;
  programId: string;
  programName: string;
  accessStatus: string;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  durationLabel: string;
  enrolledAt: string;
}

export interface AdminEnrollmentComment {
  commentId: string;
  accessId: string;
  updateNote: string;
  createdAt: string;
}

export interface PostCommentResponse {
  accessId: string;
  sent: boolean;
}

export interface GdprRequest {
  requestId: string;
  userId: string;
  userEmail: string;
  requestType: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AuditLogEntry {
  logId: string;
  performedBy: string;
  performedByEmail: string;
  entityType: string;
  entityId: string;
  before: string | null;
  after: string | null;
  createdAt: string;
}

export interface AnalyticsSummary {
  period: string;
  newUsers: number;
  newOrders: number;
  revenue: number;
  activeEnrollments: number;
}

export interface CurrencyAmount {
  currencyCode: string;
  currencySymbol: string;
  amount: number;
}

export interface ExpertPayoutBalance {
  expertId: string;
  expertName: string;
  commissionRate: number;
  totalEarned: CurrencyAmount[];
  expertShare: CurrencyAmount[];
  platformCommission: CurrencyAmount[];
  totalPaid: CurrencyAmount[];
  outstandingBalance: CurrencyAmount[];
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

export interface RecordPayoutRequest {
  expertId: string;
  amount: number;
  currencyCode: string;
  paidAt: string;
  paymentReference?: string;
  notes?: string;
}
export function getAdminSummary(): Promise<AdminSummary> {
  return apiFetch<AdminSummary>("/admin/summary");
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/admin/users");
}

export function getAdminUser(userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>("/admin/users/" + userId);
}

export function activateAdminUser(userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>("/admin/users/" + userId + "/activate", { method: "PUT" });
}

export function deactivateAdminUser(userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>("/admin/users/" + userId + "/deactivate", { method: "PUT" });
}

export function changeUserRole(userId: string, roleId: number): Promise<AdminUser> {
  return apiFetch<AdminUser>("/admin/user/change-role", {
    method: "PUT",
    body: JSON.stringify({ userId, roleId }),
  });
}

export function deleteAdminUser(userId: string): Promise<void> {
  return apiFetch<void>("/admin/users/" + userId, { method: "DELETE" });
}

export interface AdminCreateExpertProfileRequest {
  displayName?: string;
  title?: string;
  bio?: string;
  gridDescription?: string;
  detailedDescription?: string;
  profileImageUrl?: string;
  gridImageUrl?: string;
  specialisations?: string[];
  yearsExperience?: number;
  credentials?: string[];
  locationCountry?: string;
}

export function adminCreateExpertProfile(
  userId: string,
  data: AdminCreateExpertProfileRequest,
): Promise<void> {
  return apiFetch<void>("/admin/users/" + userId + "/expert-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAdminExperts(): Promise<AdminExpert[]> {
  return apiFetch<AdminExpert[]>("/admin/experts");
}

export function activateAdminExpert(expertId: string): Promise<AdminExpert> {
  return apiFetch<AdminExpert>("/admin/experts/" + expertId + "/activate", { method: "PUT" });
}

export function deactivateAdminExpert(expertId: string): Promise<AdminExpert> {
  return apiFetch<AdminExpert>("/admin/experts/" + expertId + "/deactivate", { method: "PUT" });
}

export function deleteAdminExpert(expertId: string): Promise<void> {
  return apiFetch<void>("/admin/experts/" + expertId, { method: "DELETE" });
}

export function getAdminCoupons(): Promise<AdminCoupon[]> {
  return apiFetch<AdminCoupon[]>("/admin/coupons");
}

export function createAdminCoupon(data: CreateCouponRequest): Promise<AdminCoupon> {
  return apiFetch<AdminCoupon>("/admin/coupons", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminCoupon(
  couponId: string,
  data: Partial<CreateCouponRequest & { isActive: boolean }>,
): Promise<AdminCoupon> {
  return apiFetch<AdminCoupon>("/admin/coupons/" + couponId, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deactivateAdminCoupon(couponId: string): Promise<AdminCoupon> {
  return apiFetch<AdminCoupon>("/admin/coupons/" + couponId + "/deactivate", { method: "PUT" });
}

export function deleteAdminCoupon(couponId: string): Promise<void> {
  return apiFetch<void>("/admin/coupons/" + couponId, { method: "DELETE" });
}

export function getAdminOrders(): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>("/admin/orders");
}

export function refundOrder(orderId: string, refundAmount: number, reason: string): Promise<void> {
  return apiFetch<void>("/orders/" + orderId + "/refund", {
    method: "POST",
    body: JSON.stringify({ refundAmount, reason }),
  });
}

export function getAdminEnrollments(): Promise<AdminEnrollment[]> {
  return apiFetch<AdminEnrollment[]>("/admin/enrollments");
}

export function getAdminEnrollmentComments(accessId: string): Promise<AdminEnrollmentComment[]> {
  return apiFetch<AdminEnrollmentComment[]>("/admin/enrollments/" + accessId + "/comments");
}

export function postAdminEnrollmentComment(accessId: string, updateNote: string): Promise<PostCommentResponse> {
  return apiFetch<PostCommentResponse>("/admin/enrollments/" + accessId + "/comments", {
    method: "POST",
    body: JSON.stringify({ updateNote }),
  });
}

export function adminStartEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>("/admin/enrollments/" + accessId + "/start", { method: "POST" });
}

export function adminPauseEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>("/admin/enrollments/" + accessId + "/pause", { method: "POST" });
}

export function adminResumeEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>("/admin/enrollments/" + accessId + "/resume", { method: "POST" });
}

export function adminEndEnrollment(accessId: string): Promise<void> {
  return apiFetch<void>("/admin/enrollments/" + accessId + "/end", { method: "POST" });
}

export function getGdprRequests(status?: string): Promise<GdprRequest[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<GdprRequest[]>("/admin/gdpr-requests" + q);
}

export function processGdprRequest(
  requestId: string,
  action: string,
  rejectionReason: string | null,
): Promise<GdprRequest> {
  return apiFetch<GdprRequest>("/admin/gdpr-requests/" + requestId + "/process", {
    method: "POST",
    body: JSON.stringify({ action, rejectionReason }),
  });
}

export function getAuditLog(limit = 50, offset = 0): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>(`/admin/audit-log?limit=${limit}&offset=${offset}`);
}

export function getAnalytics(period: string = "month"): Promise<AnalyticsSummary[]> {
  return apiFetch<AnalyticsSummary[]>("/admin/analytics?period=" + period);
}

export function getExpertPayoutAnalytics(): Promise<ExpertPayoutBalance[]> {
  return apiFetch<ExpertPayoutBalance[]>("/admin/analytics/expert-payouts");
}

export function recordExpertPayout(data: RecordPayoutRequest): Promise<ExpertPayoutRecord> {
  return apiFetch<ExpertPayoutRecord>("/admin/expert-payouts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface DurationPriceManagement {
  priceId: string;
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  isActive: boolean;
}

export interface DurationManagement {
  durationId: string;
  label: string;
  weeks: number;
  sortOrder: number;
  isActive: boolean;
  prices: DurationPriceManagement[];
}

export function getProgramDurations(programId: string): Promise<DurationManagement[]> {
  return apiFetch<DurationManagement[]>(`/guided/programs/${encodeURIComponent(programId)}/durations`);
}