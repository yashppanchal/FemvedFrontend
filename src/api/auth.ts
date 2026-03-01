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
  role?: "user" | "expert";
  roleType?: "user" | "expert";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  role: string | { id: number; name: string };
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  // Backward compatibility for older response shape.
  token?: string;
  expiresAt?: string;
  role?: "admin" | "expert" | "user" | string;
  user: LoginResponseUser;
}

/* ---------- Endpoints ---------- */

export function loginUser(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
