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

export function initiateOrder(
  data: InitiateOrderRequest,
): Promise<InitiateOrderResponse> {
  return apiFetch<InitiateOrderResponse>("/orders/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrder(orderId: string): Promise<OrderStatusResponse> {
  return apiFetch<OrderStatusResponse>(
    `/orders/${encodeURIComponent(orderId)}`,
  );
}
