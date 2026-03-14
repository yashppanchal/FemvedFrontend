import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initiateOrder } from "../api/orders";
import { ApiError } from "../api/client";

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

  // If navigated here directly without state, send back
  if (!state?.durationId || !state?.countryCode) {
    return (
      <section className="page">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Invalid page state. Please go back and try again.</p>
          <button
            type="button"
            className="button"
            onClick={() => navigate(-1)}
          >
            Go Back
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
    <section className="page">
      <div
        style={{
          maxWidth: "480px",
          margin: "4rem auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Choose Payment Method</h1>
        <p style={{ color: "var(--color-text-muted, #666)", marginBottom: "2rem" }}>
          Select how you'd like to complete your purchase.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            type="button"
            className="button"
            disabled={loading}
            onClick={() => handleSelect("PayPal")}
            style={{ width: "100%", padding: "0.875rem" }}
          >
            {loading ? "Processing…" : "Pay with PayPal"}
          </button>

          <button
            type="button"
            className="button"
            disabled={loading}
            onClick={() => handleSelect("Stripe")}
            style={{ width: "100%", padding: "0.875rem" }}
          >
            {loading ? "Processing…" : "Pay with Card (Stripe)"}
          </button>
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>
        )}

        <button
          type="button"
          style={{
            marginTop: "1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted, #666)",
            textDecoration: "underline",
          }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </section>
  );
}
