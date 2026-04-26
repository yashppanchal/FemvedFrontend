import { apiFetch } from "./client";

// ── Admin list DTOs (match backend AdminLibraryDTOs.cs) ──────────────────────

export interface AdminLibraryDomainDto {
  domainId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  categoryCount: number;
}

export interface AdminLibraryCategoryDto {
  categoryId: string;
  domainId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  videoCount: number;
}

export interface AdminFilterTypeDto {
  filterTypeId: string;
  domainId: string;
  name: string;
  filterKey: string;
  filterTarget: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminLibraryVideoListItem {
  videoId: string;
  title: string;
  slug: string;
  cardImage?: string | null;
  videoType: string;
  status: string;
  categoryName: string;
  expertName: string;
  totalDuration?: string | null;
  episodeCount?: number | null;
  priceTierKey?: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEpisodeDto {
  episodeId: string;
  episodeNumber: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  isFreePreview: boolean;
  sortOrder: number;
}

export interface AdminVideoTagDto {
  tagId: string;
  tag: string;
  sortOrder: number;
}

export interface AdminVideoFeatureDto {
  featureId: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface AdminVideoTestimonialDto {
  testimonialId: string;
  reviewerName: string;
  reviewText: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminVideoPriceDto {
  priceId: string;
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  originalAmount?: number | null;
}

export interface AdminLibraryVideoDetail {
  videoId: string;
  categoryId: string;
  expertId: string;
  priceTierId?: string | null;
  title: string;
  slug: string;
  synopsis?: string | null;
  description?: string | null;
  cardImage?: string | null;
  heroImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  trailerUrl?: string | null;
  streamUrl?: string | null;
  videoType: string;
  totalDuration?: string | null;
  totalDurationSeconds?: number | null;
  releaseYear?: string | null;
  isFeatured: boolean;
  featuredLabel?: string | null;
  featuredPosition?: number | null;
  status: string;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
  expertName: string;
  priceTierKey?: string | null;
  episodes: AdminEpisodeDto[];
  tags: AdminVideoTagDto[];
  features: AdminVideoFeatureDto[];
  testimonials: AdminVideoTestimonialDto[];
  priceOverrides: AdminVideoPriceDto[];
}

export interface AdminTierPriceDto {
  priceId: string;
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
}

export interface AdminPriceTierDto {
  tierId: string;
  tierKey: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
  prices: AdminTierPriceDto[];
}

// ── Request bodies ───────────────────────────────────────────────────────────

export interface CreateLibraryDomainRequest {
  name: string;
  slug: string;
  description?: string | null;
  heroImageDesktop?: string | null;
  heroImageMobile?: string | null;
  heroImagePortrait?: string | null;
  sortOrder?: number;
}

export interface UpdateLibraryDomainRequest {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  heroImageDesktop?: string | null;
  heroImageMobile?: string | null;
  heroImagePortrait?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface CreateLibraryCategoryRequest {
  domainId: string;
  name: string;
  slug: string;
  description?: string | null;
  cardImage?: string | null;
  sortOrder?: number;
}

export interface UpdateLibraryCategoryRequest {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  cardImage?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface CreateLibraryFilterTypeRequest {
  domainId: string;
  name: string;
  filterKey: string;
  filterTarget: string;
  sortOrder?: number;
}

export interface UpdateLibraryFilterTypeRequest {
  name?: string | null;
  filterKey?: string | null;
  filterTarget?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface LibraryFeatureInput {
  icon: string;
  description: string;
}

export interface CreateLibraryVideoPriceInput {
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  originalAmount?: number | null;
}

export interface CreateLibraryVideoRequest {
  categoryId: string;
  expertId: string;
  priceTierId?: string | null;
  title: string;
  slug: string;
  synopsis?: string | null;
  description?: string | null;
  cardImage?: string | null;
  heroImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  trailerUrl?: string | null;
  streamUrl?: string | null;
  videoType: string;
  totalDuration?: string | null;
  totalDurationSeconds?: number | null;
  releaseYear?: string | null;
  isFeatured?: boolean;
  featuredLabel?: string | null;
  featuredPosition?: number | null;
  sortOrder?: number;
  tags?: string[];
  features?: LibraryFeatureInput[];
  prices?: CreateLibraryVideoPriceInput[];
}

export interface UpdateLibraryVideoRequest {
  categoryId?: string | null;
  priceTierId?: string | null;
  title?: string | null;
  slug?: string | null;
  synopsis?: string | null;
  description?: string | null;
  cardImage?: string | null;
  heroImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  trailerUrl?: string | null;
  streamUrl?: string | null;
  totalDuration?: string | null;
  totalDurationSeconds?: number | null;
  releaseYear?: string | null;
  isFeatured?: boolean | null;
  featuredLabel?: string | null;
  featuredPosition?: number | null;
  sortOrder?: number | null;
  tags?: string[] | null;
  features?: LibraryFeatureInput[] | null;
}

export interface AddLibraryEpisodeRequest {
  episodeNumber: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  isFreePreview?: boolean;
  sortOrder?: number;
}

export interface UpdateLibraryEpisodeRequest {
  episodeNumber?: number | null;
  title?: string | null;
  description?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  isFreePreview?: boolean | null;
  sortOrder?: number | null;
}

export interface AddLibraryTestimonialRequest {
  reviewerName: string;
  reviewText: string;
  rating: number;
  sortOrder?: number;
}

export interface UpdateLibraryTestimonialRequest {
  reviewerName?: string | null;
  reviewText?: string | null;
  rating?: number | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface AddLibraryVideoPriceRequest {
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  originalAmount?: number | null;
}

export interface UpdateLibraryVideoPriceRequest {
  amount?: number | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  originalAmount?: number | null;
}

export interface AddLibraryTierPriceRequest {
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
}

export interface UpdateLibraryTierPriceRequest {
  amount?: number | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
}

// ── Analytics + Purchases DTOs ────────────────────────────────────────────────

export interface LibraryAnalyticsDto {
  totalVideos: number;
  publishedVideos: number;
  draftVideos: number;
  archivedVideos: number;
  totalPurchases: number;
  totalOrders: number;
  paidOrders: number;
  failedOrders: number;
  revenueByCurrency: LibraryCurrencyRevenueDto[];
  topSellingVideos: LibraryTopVideoDto[];
  revenueByMonth: LibraryMonthlyRevenueDto[];
}

export interface LibraryCurrencyRevenueDto {
  currencyCode: string;
  currencySymbol: string;
  totalRevenue: number;
  orderCount: number;
}

export interface LibraryTopVideoDto {
  videoId: string;
  title: string;
  videoType: string;
  purchaseCount: number;
  expertName: string;
}

export interface LibraryMonthlyRevenueDto {
  year: number;
  month: number;
  monthLabel: string;
  currencyCode: string;
  currencySymbol: string;
  totalRevenue: number;
  orderCount: number;
}

export interface LibraryPurchasesResponse {
  purchases: LibraryPurchaseDto[];
}

export interface LibraryPurchaseDto {
  accessId: string;
  userId: string;
  userName: string;
  userEmail: string;
  videoId: string;
  videoTitle: string;
  videoType: string;
  orderId: string;
  amountPaid: number;
  currencyCode: string;
  currencySymbol: string;
  purchasedAt: string;
  isActive: boolean;
}

// ── Domains ──────────────────────────────────────────────────────────────────

const BASE = "/admin/library";

export const adminLibrary = {
  // Domains
  getDomains: (): Promise<AdminLibraryDomainDto[]> =>
    apiFetch<AdminLibraryDomainDto[]>(`${BASE}/domains`, { cache: "no-store" }),
  createDomain: (r: CreateLibraryDomainRequest) =>
    apiFetch<{ id: string }>(`${BASE}/domains`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateDomain: (id: string, r: UpdateLibraryDomainRequest) =>
    apiFetch<void>(`${BASE}/domains/${id}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteDomain: (id: string) =>
    apiFetch<void>(`${BASE}/domains/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: (): Promise<AdminLibraryCategoryDto[]> =>
    apiFetch<AdminLibraryCategoryDto[]>(`${BASE}/categories`, { cache: "no-store" }),
  createCategory: (r: CreateLibraryCategoryRequest) =>
    apiFetch<{ id: string }>(`${BASE}/categories`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateCategory: (id: string, r: UpdateLibraryCategoryRequest) =>
    apiFetch<void>(`${BASE}/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteCategory: (id: string) =>
    apiFetch<void>(`${BASE}/categories/${id}`, { method: "DELETE" }),

  // Filter types
  getFilterTypes: (): Promise<AdminFilterTypeDto[]> =>
    apiFetch<AdminFilterTypeDto[]>(`${BASE}/filter-types`, { cache: "no-store" }),
  createFilterType: (r: CreateLibraryFilterTypeRequest) =>
    apiFetch<{ id: string }>(`${BASE}/filter-types`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateFilterType: (id: string, r: UpdateLibraryFilterTypeRequest) =>
    apiFetch<void>(`${BASE}/filter-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteFilterType: (id: string) =>
    apiFetch<void>(`${BASE}/filter-types/${id}`, { method: "DELETE" }),

  // Videos
  getVideos: (): Promise<AdminLibraryVideoListItem[]> =>
    apiFetch<AdminLibraryVideoListItem[]>(`${BASE}/videos`, { cache: "no-store" }),
  getVideoDetail: (id: string): Promise<AdminLibraryVideoDetail> =>
    apiFetch<AdminLibraryVideoDetail>(`${BASE}/videos/${id}`, { cache: "no-store" }),
  createVideo: (r: CreateLibraryVideoRequest) =>
    apiFetch<{ id: string }>(`${BASE}/videos`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateVideo: (id: string, r: UpdateLibraryVideoRequest) =>
    apiFetch<void>(`${BASE}/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}`, { method: "DELETE" }),
  submitVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}/submit`, { method: "POST" }),
  publishVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}/publish`, { method: "POST" }),
  rejectVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}/reject`, { method: "POST" }),
  archiveVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}/archive`, { method: "POST" }),
  restoreVideo: (id: string) =>
    apiFetch<void>(`${BASE}/videos/${id}/restore`, { method: "POST" }),

  // Episodes
  addEpisode: (videoId: string, r: AddLibraryEpisodeRequest) =>
    apiFetch<{ id: string }>(`${BASE}/videos/${videoId}/episodes`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateEpisode: (episodeId: string, r: UpdateLibraryEpisodeRequest) =>
    apiFetch<void>(`${BASE}/episodes/${episodeId}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteEpisode: (episodeId: string) =>
    apiFetch<void>(`${BASE}/episodes/${episodeId}`, { method: "DELETE" }),

  // Testimonials
  addTestimonial: (videoId: string, r: AddLibraryTestimonialRequest) =>
    apiFetch<{ id: string }>(`${BASE}/videos/${videoId}/testimonials`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateTestimonial: (testimonialId: string, r: UpdateLibraryTestimonialRequest) =>
    apiFetch<void>(`${BASE}/testimonials/${testimonialId}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteTestimonial: (testimonialId: string) =>
    apiFetch<void>(`${BASE}/testimonials/${testimonialId}`, { method: "DELETE" }),

  // Video price overrides
  addVideoPrice: (videoId: string, r: AddLibraryVideoPriceRequest) =>
    apiFetch<{ id: string }>(`${BASE}/videos/${videoId}/prices`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateVideoPrice: (priceId: string, r: UpdateLibraryVideoPriceRequest) =>
    apiFetch<void>(`${BASE}/video-prices/${priceId}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteVideoPrice: (priceId: string) =>
    apiFetch<void>(`${BASE}/video-prices/${priceId}`, { method: "DELETE" }),

  // Price tiers
  getPriceTiers: (): Promise<AdminPriceTierDto[]> =>
    apiFetch<AdminPriceTierDto[]>(`${BASE}/price-tiers`, { cache: "no-store" }),
  addTierPrice: (tierId: string, r: AddLibraryTierPriceRequest) =>
    apiFetch<{ id: string }>(`${BASE}/price-tiers/${tierId}/prices`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  updateTierPrice: (priceId: string, r: UpdateLibraryTierPriceRequest) =>
    apiFetch<void>(`${BASE}/tier-prices/${priceId}`, {
      method: "PUT",
      body: JSON.stringify(r),
    }),
  deleteTierPrice: (priceId: string) =>
    apiFetch<void>(`${BASE}/tier-prices/${priceId}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: (): Promise<LibraryAnalyticsDto> =>
    apiFetch<LibraryAnalyticsDto>(`${BASE}/analytics`, { cache: "no-store" }),
  getPurchases: (): Promise<LibraryPurchasesResponse> =>
    apiFetch<LibraryPurchasesResponse>(`${BASE}/purchases`, { cache: "no-store" }),
};
