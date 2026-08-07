import { apiFetch } from "./client";

export interface SubmitContactRequest {
  name: string;
  email: string;
  message: string;
  /** Cloudflare Turnstile token from the widget — required by the API. */
  captchaToken: string;
  /** Honeypot. Always empty for real users; bots fill it and the API silently drops them. */
  website?: string;
}

/**
 * Submits the public contact form. Returns a resolved promise on 202 Accepted.
 * Throws ApiError on validation or transport failure.
 */
export function submitContact(request: SubmitContactRequest): Promise<void> {
  return apiFetch<void>("/contact", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(request),
  });
}
