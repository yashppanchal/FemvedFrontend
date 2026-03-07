import { apiFetch } from "./client";

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

export interface GuidedTreeProgram {
  programId?: string;
  id?: string;
  _id?: string;
  programName?: string;
  name?: string;
  isActive?: boolean;
  is_active?: boolean;
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
  );
}

export function createGuidedCategory(
  data: CreateGuidedCategoryRequest,
  accessToken: string,
): Promise<string> {
  return apiFetch<string>("/guided/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function updateGuidedCategory(
  categoryId: string,
  data: UpdateGuidedCategoryRequest,
  accessToken: string,
): Promise<UpdateGuidedCategoryResponse> {
  return apiFetch<UpdateGuidedCategoryResponse>(
    `/guided/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    },
  );
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
  );
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
  });
}

export function fetchGuidedTree(): Promise<GuidedTreeResponse> {
  return apiFetch<GuidedTreeResponse>("/guided/tree");
}
