/* ------------------------------------------------------------------ */
/*  Lightweight fetch wrapper for the Femved API                       */
/* ------------------------------------------------------------------ */

const BASE_URL = "https://api.femved.com";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const msg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as Record<string, unknown>).message)
        : `Request failed with status ${status}`;
    super(msg);
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
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Try to parse body regardless of status so we can surface server errors
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body as T;
}
