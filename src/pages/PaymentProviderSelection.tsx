import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initiateOrder } from "../api/orders";
import { ApiError } from "../api/client";
import "./PaymentProviderSelection.scss";

interface SelectProviderState {
  durationId: string;
  countryCode: string;
}

export default function PaymentProviderSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SelectProviderState | null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state?.durationId || !state?.countryCode) {
    return (
      <section className="page page--providerSelection">
        <div className="providerCard">
          <p className="providerCard__sub">
            Invalid page state. Please go back and try again.
          </p>
          <button
            type="button"
            className="providerCard__back"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </section>
    );
  }

  async function handleSelect(gateway: "PayPal" | "Stripe") {
    if (!state) return;

    setLoading(true);
    setError(null);

    try {
      const order = await initiateOrder({
        durationId: state.durationId,
        countryCode: state.countryCode,
        gateway,
        idempotencyKey: crypto.randomUUID(),
      });

      const approvalUrl = order.approvalUrl;
      if (!approvalUrl) {
        setError("Checkout link is missing. Please try again.");
        return;
      }

      window.location.assign(approvalUrl);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to initiate payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page page--providerSelection">
      <div className="providerCard">

        {/* Logo */}
        <img
          src="https://femvedfrontend.netlify.app/assets/femvedlogo-U5RU3QLH.png"
          alt="FemVed"
          className="providerCard__logo"
        />

        {/* Secure badge */}
        <div className="providerCard__lockBadge">
          <svg
            className="providerCard__lockIcon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure checkout
        </div>

        <h1 className="providerCard__title">Choose Payment Method</h1>
        <p className="providerCard__sub">
          Select how you'd like to complete your purchase.
        </p>

        <hr className="providerCard__divider" />

        <div className="providerCard__options">
          {/* PayPal */}
          <button
            type="button"
            className="providerCard__btn"
            disabled={loading}
            onClick={() => handleSelect("PayPal")}
            aria-label="Pay with PayPal"
          >
            <span className="providerCard__btnIcon providerCard__btnIcon--paypal">
              🅿
            </span>
            <span className="providerCard__btnText">
              <span className="providerCard__btnTitle">PayPal</span>
              <span className="providerCard__btnDesc">
                Pay using your PayPal balance or linked card
              </span>
            </span>
            <span className="providerCard__btnArrow" aria-hidden="true">›</span>
          </button>

          {/* Stripe / Card */}
          <button
            type="button"
            className="providerCard__btn"
            disabled={loading}
            onClick={() => handleSelect("Stripe")}
            aria-label="Pay with card via Stripe"
          >
            <span className="providerCard__btnIcon providerCard__btnIcon--stripe">
              💳
            </span>
            <span className="providerCard__btnText">
              <span className="providerCard__btnTitle">Credit / Debit Card</span>
              <span className="providerCard__btnDesc">
                Visa, Mastercard, Amex — powered by Stripe
              </span>
            </span>
            <span className="providerCard__btnArrow" aria-hidden="true">›</span>
          </button>
        </div>

        {error && (
          <p className="providerCard__error" role="alert">{error}</p>
        )}

        <button
          type="button"
          className="providerCard__back"
          onClick={() => navigate(-1)}
        >
          ← Back to program
        </button>

        {/* Trust indicators */}
        <div className="providerCard__trust">
          <span>256-bit SSL encryption</span>
          <span className="providerCard__trustDot" />
          <span>PCI DSS compliant</span>
          <span className="providerCard__trustDot" />
          <span>No card data stored</span>
        </div>

      </div>
    </section>
  );
}
