/* ------------------------------------------------------------------ */
/*  Lightweight fetch wrapper for the Femved API                       */
/* ------------------------------------------------------------------ */

const BASE_URL = "https://api.femved.com/api/v1";
const TOKENS_STORAGE_KEY = "femved_tokens";

interface StoredTokens {
  accessToken?: string;
}

function getStoredAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTokens;
    return typeof parsed.accessToken === "string" && parsed.accessToken
      ? parsed.accessToken
      : null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    // Try backend ProblemDetails "detail" field first, then "message", then generic
    const msg =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).detail
          ? String((body as Record<string, unknown>).detail)
          : (body as Record<string, unknown>).message
            ? String((body as Record<string, unknown>).message)
            : `Request failed with status ${status}`
        : `Request failed with status ${status}`;
    super(msg);
    this.status = status;
    this.body = body;
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
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  headers.set("Content-Type", "application/json");

  // Auto-attach bearer token for protected endpoints when available.
  if (!skipAuth && !headers.has("Authorization")) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...requestOptions,
    headers,
  });

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
