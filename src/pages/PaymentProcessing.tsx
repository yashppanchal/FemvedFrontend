import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getOrder } from "../api/orders";
import { LoadingScreen } from "../components/LoadingScreen";
import {
  PAYMENT_SUCCESS_REDIRECT_CARD_DELAY_MS,
  PAYMENT_SUCCESS_REDIRECT_CARD_VISIBLE_MS,
  PaymentProcessingSuccessView,
} from "./PaymentProcessingSuccessView";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 30000;

type Phase = "polling" | "paid" | "failed" | "timeout";

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const returnTo = searchParams.get("returnTo") ?? "/all-guided-programs";
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("polling");
  const startedAt = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!orderId) {
      setPhase("failed");
      return;
    }

    let stopped = false;

    async function poll() {
      if (stopped) return;

      if (Date.now() - startedAt.current >= POLL_MAX_MS) {
        setPhase("timeout");
        return;
      }

      try {
        const order = await getOrder(orderId);
        if (stopped) return;

        if (order.status === "Paid") {
          setPhase("paid");
          return;
        }
        if (order.status === "Failed" || order.status === "Cancelled") {
          setPhase("failed");
          return;
        }
      } catch {
        // Keep polling on transient errors
      }

      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();

    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId]);

  // Success card, then redirect card for 5s, then dashboard
  useEffect(() => {
    if (phase !== "paid") return;
    const t = setTimeout(
      () => navigate("/dashboard"),
      PAYMENT_SUCCESS_REDIRECT_CARD_DELAY_MS +
        PAYMENT_SUCCESS_REDIRECT_CARD_VISIBLE_MS,
    );
    return () => clearTimeout(t);
  }, [phase, navigate]);

  if (phase === "polling") {
    return (
      <section className="page page--paymentProcessing">
        <LoadingScreen message="Processing your payment…" />
      </section>
    );
  }

  if (phase === "paid") {
    return (
      <PaymentProcessingSuccessView
        showRedirectCardAfterMs={PAYMENT_SUCCESS_REDIRECT_CARD_DELAY_MS}
      />
    );
  }

  if (phase === "timeout") {
    return (
      <section className="page page--paymentProcessing">
        <div className="processingCard">
          <h1 className="page__title">Still processing</h1>
          <p className="page__lead">
            Your payment is taking longer than expected. Please check your{" "}
            <Link to="/orders">orders page</Link> in a few minutes.
          </p>
          {orderId && (
            <p className="page__lead" style={{ fontSize: "12px", color: "rgba(15,15,16,0.45)", marginTop: "8px" }}>
              Order reference: {orderId}
            </p>
          )}
        </div>
      </section>
    );
  }

  // phase === "failed"
  return (
    <section className="page page--paymentProcessing">
      <div className="processingCard">
        <div
          className="processingCard__icon processingCard__icon--failed"
          aria-hidden="true"
        />
        <h1 className="page__title">Payment failed</h1>
        <p className="page__lead">
          Something went wrong with your payment. Please try again.
        </p>
        <button
          type="button"
          className="button processingCard__retryButton"
          onClick={() => navigate(returnTo)}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
