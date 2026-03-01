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

export interface GuidedTreeDomain {
  domainId?: string;
  id?: string;
  _id?: string;
  domainName?: string;
  name?: string;
  categories?: GuidedTreeCategory[];
}

export interface GuidedTreeCategory {
  categoryId?: string;
  id?: string;
  _id?: string;
  categoryType?: string;
  categoryName?: string;
  name?: string;
  categoryPageData?: {
    categoryType?: string;
  };
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
): Promise<CreateGuidedDomainResponse> {
  return apiFetch<CreateGuidedDomainResponse>(
    `/guided/domains/${encodeURIComponent(domainId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    },
  );
}

export function fetchGuidedTree(): Promise<GuidedTreeResponse> {
  return apiFetch<GuidedTreeResponse>("/guided/tree");
}
