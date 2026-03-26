/* ------------------------------------------------------------------ */
/*  Lightweight fetch wrapper for the Femved API                       */
/* ------------------------------------------------------------------ */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.femved.com/api/v1";
const TOKENS_STORAGE_KEY = "femved_tokens";

interface StoredTokens {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

function getStoredTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

function getStoredAccessToken(): string | null {
  const tokens = getStoredTokens();
  return typeof tokens?.accessToken === "string" && tokens.accessToken
    ? tokens.accessToken
    : null;
}

function isAccessTokenExpired(): boolean {
  const tokens = getStoredTokens();
  if (!tokens?.accessTokenExpiresAt) return true;
  const expiry = Date.parse(tokens.accessTokenExpiresAt);
  if (Number.isNaN(expiry)) return true;
  // Treat as expired 30s before actual expiry to avoid race conditions
  return expiry - 30_000 < Date.now();
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = getStoredTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!res.ok) return null;

      const data = await res.json();
      const newAccessToken = data.accessToken ?? data.token;
      if (!newAccessToken) return null;

      const updated: StoredTokens = {
        accessToken: newAccessToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt ?? data.expiresAt ?? tokens.accessTokenExpiresAt,
        refreshToken: data.refreshToken ?? tokens.refreshToken,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt ?? tokens.refreshTokenExpiresAt,
      };
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(updated));
      return newAccessToken as string;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  /** Field-level validation errors keyed by field name, e.g. { email: ["Already exists."] } */
  errors: Record<string, string[]> | null;

  constructor(status: number, body: unknown) {
    const b = typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;

    // Extract field-level errors first (most specific)
    let fieldErrors: Record<string, string[]> | null = null;
    if (b?.errors && typeof b.errors === "object") {
      fieldErrors = b.errors as Record<string, string[]>;
    }

    let msg: string;
    if (fieldErrors) {
      // Join all field messages into a readable sentence
      const messages = Object.values(fieldErrors).flat().filter(Boolean);
      msg = messages.length > 0
        ? messages.join(" ")
        : String(b?.detail ?? b?.title ?? `Request failed with status ${status}`);
    } else if (b?.detail) {
      msg = String(b.detail);
    } else if (b?.title) {
      msg = String(b.title);
    } else if (b?.message) {
      msg = String(b.message);
    } else {
      const statusMessages: Record<number, string> = {
        400: "The request was invalid. Please check your input and try again.",
        401: "You are not authorised to perform this action. Please log in again.",
        403: "Access denied. You do not have permission to do this.",
        404: "The requested resource was not found.",
        409: "A conflict occurred. The resource may already exist.",
        422: "The request could not be processed. Please check your input.",
        429: "Too many requests. Please wait a moment and try again.",
        500: "Something went wrong on the server. Please try again later.",
        502: "The server is temporarily unavailable. Please try again shortly.",
        503: "The service is currently unavailable. Please try again later.",
      };
      msg = statusMessages[status] ?? `Request failed with status ${status}`;
    }

    super(msg);
    this.status = status;
    this.body = body;
    this.errors = fieldErrors;
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

/**
 * Thin wrapper around `fetch` that:
 * - Prepends the base URL
 * - Sets JSON headers
 * - Throws `ApiError` on non-2xx responses
 * - Automatically refreshes expired access tokens on 401
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...requestOptions } = options;

  const doRequest = async (token: string | null) => {
    const headers = new Headers(requestOptions.headers);
    headers.set("Content-Type", "application/json");
    if (!skipAuth && token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(`${BASE_URL}${path}`, { ...requestOptions, headers });
  };

  // Proactively refresh if access token is about to expire
  let accessToken = getStoredAccessToken();
  if (!skipAuth && accessToken && isAccessTokenExpired()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) accessToken = refreshed;
  }

  let res = await doRequest(accessToken);

  // Retry once on 401 with a refreshed token
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await doRequest(refreshed);
    }
  }

  // Parse JSON when possible and gracefully fall back to plain text responses.
  let body: unknown;
  try {
    const rawBody = await res.text();
    if (!rawBody) {
      body = null;
    } else {
      try {
        body = JSON.parse(rawBody) as unknown;
      } catch {
        body = rawBody;
      }
    }
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body as T;
}

/** Exported for use by modules that need the base URL (e.g. guidedPrograms cache). */
export { BASE_URL };
