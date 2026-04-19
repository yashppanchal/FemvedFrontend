import { apiFetch } from "./client";

export type PaymentGateway = "CashFree" | "PayPal" | "Stripe";

export type OrderStatus = "Pending" | "Paid" | "Failed" | "Cancelled";

export interface InitiateOrderRequest {
  durationId?: string;
  videoId?: string;
  countryCode: string;
  gateway: PaymentGateway;
  couponCode?: string;
  idempotencyKey?: string;
}

export interface InitiateOrderResponse {
  orderId: string;
  gatewayOrderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  symbol: string;
  gateway: "CASHFREE" | "PAYPAL" | "STRIPE";
  /** PayPal only — URL to redirect the user to */
  approvalUrl?: string;
}

export interface OrderStatusResponse {
  orderId: string;
  status: OrderStatus;
  amount?: number;
  currency?: string;
}

function pickStr(
  raw: Record<string, unknown>,
  camel: string,
  snake: string,
): string {
  const a = raw[camel];
  const b = raw[snake];
  if (typeof a === "string" && a.length > 0) return a;
  if (typeof b === "string" && b.length > 0) return b;
  if (typeof a === "string") return a;
  if (typeof b === "string") return b;
  return "";
}

/**
 * Maps API JSON to the shape the app expects. Some backends send snake_case;
 * Cashfree requires a non-empty paymentSessionId — undefined mapping surfaces as their raw JSON error.
 */
function normalizeInitiateOrderResponse(raw: unknown): InitiateOrderResponse {
  if (raw === null || typeof raw !== "object") {
    throw new Error("Invalid order response from server.");
  }
  const r = raw as Record<string, unknown>;
  const amountRaw = r.amount;
  const amount =
    typeof amountRaw === "number"
      ? amountRaw
      : typeof amountRaw === "string"
        ? Number(amountRaw)
        : NaN;

  const approvalUrl =
    typeof r.approvalUrl === "string"
      ? r.approvalUrl
      : typeof r.approval_url === "string"
        ? r.approval_url
        : undefined;

  return {
    orderId: pickStr(r, "orderId", "order_id"),
    gatewayOrderId: pickStr(r, "gatewayOrderId", "gateway_order_id"),
    paymentSessionId: pickStr(r, "paymentSessionId", "payment_session_id"),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: pickStr(r, "currency", "currency"),
    symbol: pickStr(r, "symbol", "symbol"),
    gateway: r.gateway as InitiateOrderResponse["gateway"],
    approvalUrl,
  };
}

export function initiateOrder(
  data: InitiateOrderRequest,
): Promise<InitiateOrderResponse> {
  return apiFetch<unknown>("/orders/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(normalizeInitiateOrderResponse);
}

export function getOrder(orderId: string): Promise<OrderStatusResponse> {
  return apiFetch<OrderStatusResponse>(
    `/orders/${encodeURIComponent(orderId)}`,
  );
}
