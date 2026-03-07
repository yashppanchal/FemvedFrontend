import { apiFetch } from "./client";

export interface UpsertCurrentExpertRequest {
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

export function upsertCurrentExpertProfile(
  data: UpsertCurrentExpertRequest,
  accessToken: string,
): Promise<ExpertProfileResponse> {
  return apiFetch<ExpertProfileResponse>("/experts/me", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function fetchCurrentExpertProfile(
  accessToken: string,
): Promise<ExpertProfileResponse> {
  return apiFetch<ExpertProfileResponse>("/experts/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
