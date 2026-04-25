import { apiFetch } from "./client";

// ── Public catalog types (match API DTOs exactly) ────────────────────────────

export interface LibraryTreeResponse {
  domain: LibraryDomainDto;
  filters: LibraryFilterDto[];
  featuredVideos: LibraryFeaturedVideoDto[];
  categories: LibraryCategoryDto[];
}

export interface LibraryDomainDto {
  domainId: string;
  domainName: string;
  heroImageDesktop?: string | null;
  heroImageMobile?: string | null;
  heroImagePortrait?: string | null;
}

export interface LibraryFilterDto {
  filterId: string;
  name: string;
  filterKey: string;
  filterTarget: string;
}

export interface LibraryFeaturedVideoDto {
  videoId: string;
  position?: number | null;
  eyebrowText?: string | null;
  title: string;
  expertName: string;
  totalDuration?: string | null;
  episodeCount?: number | null;
  price: string;
  cardImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  videoType: string;
}

export interface LibraryCategoryDto {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: LibraryVideoCardDto[];
}

export interface LibraryVideoCardDto {
  videoId: string;
  title: string;
  slug: string;
  synopsis?: string | null;
  cardImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  videoType: string;
  totalDuration?: string | null;
  episodeCount?: number | null;
  releaseYear?: string | null;
  price: string;
  originalPrice?: string | null;
  expertName: string;
  expertTitle: string;
  tags: string[];
}

// ── Video detail types ───────────────────────────────────────────────────────

export interface LibraryVideoDetailResponse {
  videoId: string;
  title: string;
  slug: string;
  synopsis?: string | null;
  description?: string | null;
  cardImage?: string | null;
  heroImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  trailerUrl?: string | null;
  videoType: string;
  totalDuration?: string | null;
  releaseYear?: string | null;
  price: string;
  originalPrice?: string | null;
  priceTier: string;
  expertId: string;
  expertName: string;
  expertTitle: string;
  expertGridImageUrl?: string | null;
  expertImageUrl?: string | null;
  expertGridDescription?: string | null;
  tags: string[];
  episodes: LibraryEpisodeDto[];
  features: LibraryFeatureDto[];
  testimonials: LibraryTestimonialDto[];
  isPurchased: boolean;
}

export interface LibraryEpisodeDto {
  episodeId: string;
  episodeNumber: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  isFreePreview: boolean;
  isLocked: boolean;
}

export interface LibraryFeatureDto {
  icon: string;
  description: string;
}

export interface LibraryTestimonialDto {
  reviewerName: string;
  reviewText: string;
  rating: number;
}

// ── Public fetch ─────────────────────────────────────────────────────────────

export function fetchLibraryTree(
  countryCode?: string,
): Promise<LibraryTreeResponse> {
  const query =
    countryCode != null && countryCode !== ""
      ? `?${new URLSearchParams({ countryCode }).toString()}`
      : "";
  return apiFetch<LibraryTreeResponse>(`/library/tree${query}`, {
    cache: "no-store",
    skipAuth: true,
  });
}

export function fetchLibraryCategory(
  slug: string,
  countryCode?: string,
): Promise<LibraryCategoryDto> {
  const query =
    countryCode != null && countryCode !== ""
      ? `?${new URLSearchParams({ countryCode }).toString()}`
      : "";
  return apiFetch<LibraryCategoryDto>(
    `/library/categories/${encodeURIComponent(slug)}${query}`,
    { cache: "no-store", skipAuth: true },
  );
}

export function fetchVideoBySlug(
  slug: string,
  countryCode?: string,
): Promise<LibraryVideoDetailResponse> {
  const query =
    countryCode != null && countryCode !== ""
      ? `?${new URLSearchParams({ countryCode }).toString()}`
      : "";
  return apiFetch<LibraryVideoDetailResponse>(
    `/library/videos/${encodeURIComponent(slug)}${query}`,
    { cache: "no-store", skipAuth: true },
  );
}

// ── My library + streaming types ─────────────────────────────────────────────

export interface MyLibraryResponse {
  videos: MyLibraryVideoDto[];
}

export interface MyLibraryVideoDto {
  videoId: string;
  title: string;
  slug: string;
  cardImage?: string | null;
  iconEmoji?: string | null;
  gradientClass?: string | null;
  videoType: string;
  totalDuration?: string | null;
  episodeCount?: number | null;
  expertName: string;
  purchasedAt: string;
  watchProgressSeconds: number;
  lastWatchedAt?: string | null;
  categorySlug: string;
}

export interface LibraryStreamResponse {
  videoId: string;
  videoType: string;
  streamUrl?: string | null;
  episodes: LibraryStreamEpisodeDto[];
  overallProgressSeconds: number;
  lastWatchedAt?: string | null;
}

export interface LibraryStreamEpisodeDto {
  episodeId: string;
  episodeNumber: number;
  title: string;
  streamUrl?: string | null;
  watchProgressSeconds: number;
  isCompleted: boolean;
}

export function fetchMyLibrary(): Promise<MyLibraryResponse> {
  return apiFetch<MyLibraryResponse>("/users/me/library", {
    cache: "no-store",
  });
}

export function fetchVideoStream(slug: string): Promise<LibraryStreamResponse> {
  return apiFetch<LibraryStreamResponse>(
    `/library/videos/${encodeURIComponent(slug)}/stream`,
    { cache: "no-store" },
  );
}

export function updateWatchProgress(
  videoId: string,
  progressSeconds: number,
  episodeId?: string,
): Promise<void> {
  return apiFetch<void>(
    `/users/me/library/${encodeURIComponent(videoId)}/progress`,
    {
      method: "PUT",
      body: JSON.stringify({
        progressSeconds,
        ...(episodeId ? { episodeId } : {}),
      }),
    },
  );
}
