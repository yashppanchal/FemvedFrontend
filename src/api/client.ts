/* ------------------------------------------------------------------ */
/*  Lightweight fetch wrapper for the Femved API                       */
/* ------------------------------------------------------------------ */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.femved.com/api/v1";
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
