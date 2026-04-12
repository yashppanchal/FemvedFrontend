import "./PurchaseCard.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LibraryFeatureDto } from "../../api/library";
import { hasValidAccessToken, useAuth } from "../../auth/useAuth";
import { useCountry } from "../../country/useCountry";
import { initiateOrder } from "../../api/orders";
import { ApiError } from "../../api/client";

interface PurchaseCardProps {
  videoId: string;
  title: string;
  videoType: string;
  expertName: string;
  price: string;
  originalPrice?: string | null;
  features: LibraryFeatureDto[];
  isPurchased: boolean;
  videoSlug: string;
}

export default function PurchaseCard({
  videoId,
  title,
  videoType,
  expertName,
  price,
  originalPrice,
  features,
  isPurchased,
  videoSlug,
}: PurchaseCardProps) {
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const { country } = useCountry();
  const typeLabel = videoType === "SERIES" ? "Series" : "Masterclass";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    if (!hasValidAccessToken(tokens)) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Map "UK" → "GB" for the backend price/location lookup
    const apiCountryCode = country === "UK" ? "GB" : country;

    // Indian users must use CashFree — bypass the provider-selection page
    if (apiCountryCode === "IN") {
      setLoading(true);
      setError(null);
      try {
        const order = await initiateOrder({
          videoId,
          countryCode: "IN",
          gateway: "CashFree",
          idempotencyKey: crypto.randomUUID(),
        });

        if (order.gateway === "CASHFREE") {
          const { load } = await import("@cashfreepayments/cashfree-js");
          const mode = (import.meta.env.VITE_CASHFREE_MODE ?? "sandbox") as
            | "sandbox"
            | "production";
          const cashfree = await load({ mode });

          const result = await cashfree.checkout({
            paymentSessionId: order.paymentSessionId,
            redirectTarget: "_modal",
          });

          if (result?.error) {
            setError(
              result.error.message ?? "Payment was not completed. Please try again.",
            );
            return;
          }

          const returnTo = encodeURIComponent(window.location.pathname);
          navigate(
            `/payment/processing?orderId=${encodeURIComponent(order.orderId)}&returnTo=${returnTo}`,
          );
        } else {
          setError("Unexpected payment gateway. Please try again or contact support.");
        }
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Payment failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Non-India: choose PayPal or Stripe on the provider-selection page
    navigate("/payment/select-provider", {
      state: {
        videoId,
        videoSlug,
        countryCode: apiCountryCode,
      },
    });
  }

  return (
    <aside className="purchaseCard">
      <p className="purchaseCard__eyebrow">{typeLabel}</p>
      <p className="purchaseCard__title">{title}</p>
      <p className="purchaseCard__instructor">
        Led by <strong>{expertName}</strong>
      </p>

      {originalPrice && (
        <p className="purchaseCard__originalLine">
          <span className="purchaseCard__originalPrice">{originalPrice}</span>
        </p>
      )}

      {isPurchased ? (
        <button
          type="button"
          className="purchaseCard__btn purchaseCard__btn--owned"
          disabled
        >
          Already purchased
        </button>
      ) : (
        <button
          type="button"
          className="purchaseCard__btn"
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? "Processing…" : `Purchase — ${price}`}
        </button>
      )}

      {error && (
        <p className="purchaseCard__error" role="alert">{error}</p>
      )}

      <p className="purchaseCard__access">
        One-time purchase. Lifetime access.
      </p>

      {features.length > 0 && (
        <ul className="purchaseCard__features">
          {features.map((f, i) => (
            <li key={i} className="purchaseCard__feature">
              <span className="purchaseCard__featureIcon">{f.icon}</span>
              <span>{f.description}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
