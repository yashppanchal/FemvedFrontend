import { apiFetch } from "./client";

export interface SubmitContactRequest {
  name: string;
  email: string;
  message: string;
}

/**
 * Submits the public contact form. Returns a resolved promise on 202 Accepted.
 * Throws ApiError on validation or transport failure.
 */
export function submitContact(request: SubmitContactRequest): Promise<void> {
  return apiFetch<void>("/contact", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
