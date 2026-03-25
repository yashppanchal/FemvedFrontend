import { apiFetch } from "./client";
const GUIDED_PROGRAMS_VERSION_STORAGE_KEY = "femved.guidedPrograms.version";

function bumpGuidedProgramsCacheVersion(): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(GUIDED_PROGRAMS_VERSION_STORAGE_KEY);
    const parsed = Number(raw);
    const nextVersion = Number.isFinite(parsed) ? parsed + 1 : 1;
    window.localStorage.setItem(
      GUIDED_PROGRAMS_VERSION_STORAGE_KEY,
      String(nextVersion),
    );
  } catch {
    // Cache invalidation is best-effort and should not block admin actions.
  }
}

export interface CreateGuidedDomainRequest {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface CreateGuidedDomainResponse {
  id?: string;
  domainId?: string;
  _id?: string;
  name?: string;
}

export interface DeleteGuidedDomainResponse {
  id: string;
  isDeleted: boolean;
}

export interface DeleteGuidedCategoryResponse {
  id: string;
  isDeleted: boolean;
}

export interface CreateGuidedCategoryRequest {
  domainId: string;
  name: string;
  slug: string;
  categoryType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel: string;
  ctaLink: string;
  pageHeader: string;
  imageUrl: string;
  image_url?: string;
  categoryPageDataImage?: string;
  sortOrder: number;
  parentId?: string | null;
  whatsIncluded: string[];
  keyAreas: string[];
}

export interface UpdateGuidedCategoryRequest {
  name: string;
  categoryType: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel: string;
  ctaLink: string;
  pageHeader: string;
  imageUrl: string;
  image_url?: string;
  categoryPageDataImage?: string;
  sortOrder: number;
  whatsIncluded: string[];
  keyAreas: string[];
}

export interface UpdateGuidedCategoryResponse {
  id: string;
  isUpdated: boolean;
}

export interface CreateGuidedProgramPriceRequest {
  locationCode: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
}

export interface CreateGuidedProgramDurationRequest {
  label: string;
  weeks: number;
  sortOrder: number;
  prices: CreateGuidedProgramPriceRequest[];
}

export interface CreateGuidedProgramDetailSectionRequest {
  heading: string;
  description: string;
  sortOrder: number;
}

export interface CreateGuidedProgramRequest {
  categoryId: string;
  expertId?: string;
  name: string;
  slug: string;
  gridDescription: string;
  gridImageUrl: string;
  overview: string;
  sortOrder: number;
  durations: CreateGuidedProgramDurationRequest[];
  whatYouGet: string[];
  whoIsThisFor: string[];
  tags: string[];
  detailSections: CreateGuidedProgramDetailSectionRequest[];
}

export interface GuidedTreeDomain {
  domainId?: string;
  id?: string;
  _id?: string;
  domainName?: string;
  name?: string;
  isActive?: boolean;
  is_active?: boolean;
  categories?: GuidedTreeCategory[];
}

export interface GuidedTreeCategory {
  categoryId?: string;
  id?: string;
  _id?: string;
  categoryType?: string;
  categoryName?: string;
  name?: string;
  isActive?: boolean;
  is_active?: boolean;
  categoryPageData?: {
    categoryPageDataImage?: string;
    imageUrl?: string;
    image_url?: string;
    categoryType?: string;
    categoryHeroTitle?: string;
    categoryHeroSubtext?: string;
    categoryCtaLabel?: string;
    categoryCtaTo?: string;
    categoryPageHeader?: string;
    whatsIncludedInCategory?: string[];
    categoryPageKeyAreas?: string[];
  };
  programsInCategory?: GuidedTreeProgram[];
}

export interface GuidedTreeProgramDuration {
  durationId?: string;
  durationLabel?: string;
  durationPrice?: string;
}

export interface GuidedTreeProgramDetailSection {
  heading?: string;
  description?: string;
}

export interface GuidedTreeProgramPageDetails {
  overview?: string;
  whatYouGet?: string[];
  whoIsThisFor?: string[];
  tags?: string[];
  sortOrder?: number;
  detailSections?: GuidedTreeProgramDetailSection[];
}

export interface GuidedTreeProgram {
  programId?: string;
  id?: string;
  _id?: string;
  programName?: string;
  name?: string;
  programGridDescription?: string;
  programGridImage?: string;
  isActive?: boolean;
  is_active?: boolean;
  programDurations?: GuidedTreeProgramDuration[];
  programPageDisplayDetails?: GuidedTreeProgramPageDetails;
}

export interface GuidedTreeResponse {
  domains?: GuidedTreeDomain[];
}

export function createGuidedDomain(
  data: CreateGuidedDomainRequest,
  accessToken: string,
): Promise<CreateGuidedDomainResponse> {
  return apiFetch<CreateGuidedDomainResponse>("/guided/domains", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  }).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function updateGuidedDomain(
  domainId: string,
  data: CreateGuidedDomainRequest,
  accessToken: string,
): Promise<void> {
  return apiFetch<void>(`/guided/domains/${encodeURIComponent(domainId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  }).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function deleteGuidedDomain(
  domainId: string,
  accessToken: string,
): Promise<DeleteGuidedDomainResponse> {
  return apiFetch<DeleteGuidedDomainResponse>(
    `/guided/domains/${encodeURIComponent(domainId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function createGuidedCategory(
  data: CreateGuidedCategoryRequest,
  accessToken: string,
): Promise<string> {
  const normalizedImage = data.imageUrl.trim();
  return apiFetch<string>("/guided/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...data,
      imageUrl: normalizedImage,
      image_url: normalizedImage,
      categoryPageDataImage: normalizedImage,
    }),
  }).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function updateGuidedCategory(
  categoryId: string,
  data: UpdateGuidedCategoryRequest,
  accessToken: string,
): Promise<UpdateGuidedCategoryResponse> {
  const normalizedImage = data.imageUrl.trim();
  return apiFetch<UpdateGuidedCategoryResponse>(
    `/guided/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...data,
        imageUrl: normalizedImage,
        image_url: normalizedImage,
        categoryPageDataImage: normalizedImage,
      }),
    },
  ).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function deleteGuidedCategory(
  categoryId: string,
  accessToken: string,
): Promise<DeleteGuidedCategoryResponse> {
  return apiFetch<DeleteGuidedCategoryResponse>(
    `/guided/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function createGuidedProgram(
  data: CreateGuidedProgramRequest,
  accessToken: string,
): Promise<unknown> {
  return apiFetch<unknown>("/guided/programs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  }).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export interface UpdateGuidedProgramRequest {
  name?: string;
  gridDescription?: string;
  gridImageUrl?: string;
  overview?: string;
  sortOrder?: number;
  whatYouGet?: string[];
  whoIsThisFor?: string[];
  tags?: string[];
  detailSections?: CreateGuidedProgramDetailSectionRequest[];
}

export interface UpdateGuidedProgramResponse {
  id: string;
  isUpdated: boolean;
}

export interface DeleteGuidedProgramResponse {
  id: string;
  isDeleted: boolean;
}

export function updateGuidedProgram(
  programId: string,
  data: UpdateGuidedProgramRequest,
  accessToken: string,
): Promise<UpdateGuidedProgramResponse> {
  return apiFetch<UpdateGuidedProgramResponse>(
    `/guided/programs/${encodeURIComponent(programId)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    },
  ).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export function deleteGuidedProgram(
  programId: string,
  accessToken: string,
): Promise<DeleteGuidedProgramResponse> {
  return apiFetch<DeleteGuidedProgramResponse>(
    `/guided/programs/${encodeURIComponent(programId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  ).then((response) => {
    bumpGuidedProgramsCacheVersion();
    return response;
  });
}

export async function submitProgramForReview(programId: string): Promise<void> {
  await apiFetch<void>(`/guided/programs/${encodeURIComponent(programId)}/submit`, {
    method: "POST",
  });
}

export async function publishProgram(programId: string): Promise<void> {
  await apiFetch<void>(`/guided/programs/${encodeURIComponent(programId)}/publish`, {
    method: "POST",
  });
  bumpGuidedProgramsCacheVersion();
}

export async function rejectProgram(programId: string): Promise<void> {
  await apiFetch<void>(`/guided/programs/${encodeURIComponent(programId)}/reject`, {
    method: "POST",
  });
}

export async function archiveProgram(programId: string): Promise<void> {
  await apiFetch<void>(`/guided/programs/${encodeURIComponent(programId)}/archive`, {
    method: "POST",
  });
  bumpGuidedProgramsCacheVersion();
}

export function fetchGuidedTree(): Promise<GuidedTreeResponse> {
  return apiFetch<GuidedTreeResponse>("/guided/tree", {
    cache: "no-store",
    skipAuth: true,
  });
}
