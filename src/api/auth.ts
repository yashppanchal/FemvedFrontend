/* ------------------------------------------------------------------ */
/*  Auth API calls                                                     */
/* ------------------------------------------------------------------ */

import { apiFetch } from "./client";

/* ---------- Request / Response types ---------- */

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  mobileNumber: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  tokens: AuthTokens;
}

/* ---------- Endpoints ---------- */

export function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
