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
    const msg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as Record<string, unknown>).message)
        : `Request failed with status ${status}`;
    super(msg);
    this.status = status;
    this.body = body;
    this.name = "ApiError";
  }
}

/**
 * Thin wrapper around `fetch` that:
 * - Prepends the base URL
 * - Sets JSON headers
 * - Throws `ApiError` on non-2xx responses
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Auto-attach bearer token for protected endpoints when available.
  if (!headers.has("Authorization")) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
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
