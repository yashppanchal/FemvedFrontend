import { useEffect, useState } from "react";
import { LoadingScreen } from "../components/LoadingScreen";
import "./PaymentProcessing.scss";

/** Time the success card is shown alone before the redirect card appears (checkout flow). */
export const PAYMENT_SUCCESS_REDIRECT_CARD_DELAY_MS = 10000;

/** How long the redirect card stays visible before navigating to the dashboard. */
export const PAYMENT_SUCCESS_REDIRECT_CARD_VISIBLE_MS = 5000;

type PaymentProcessingSuccessViewProps = {
  /**
   * If greater than 0, after that delay the success panel is replaced by the redirect panel.
   * `0` keeps only the success panel (no redirect step).
   */
  showRedirectCardAfterMs?: number;
};

/** Shared “payment successful” flow (post-purchase, before dashboard redirect). */
export function PaymentProcessingSuccessView({
  showRedirectCardAfterMs = 0,
}: PaymentProcessingSuccessViewProps) {
  const [showRedirectCard, setShowRedirectCard] = useState(false);

  useEffect(() => {
    if (showRedirectCardAfterMs <= 0) return;
    const t = setTimeout(
      () => setShowRedirectCard(true),
      showRedirectCardAfterMs,
    );
    return () => clearTimeout(t);
  }, [showRedirectCardAfterMs]);

  return (
    <section
      className={
        showRedirectCard
          ? "page page--paymentProcessing"
          : "page page--paymentProcessing page--paymentSuccessFlow"
      }
    >
      {!showRedirectCard ? (
        <div className="paymentSuccessFlowPanel">
          <div className="processingCard processingCard--plain paymentSuccessFlowPanel__content">
            <div
              className="processingCard__icon processingCard__icon--success"
              aria-hidden="true"
            />
            <p className="processingCard__title">PAYMENT SUCCESSFUL</p>
            <h1 className="page__title">You&apos;re all set!</h1>
            <p className="page__lead">
              We&apos;ve sent an order confirmation about your program details
              to your email. Give it a minute to arrive.
            </p>
            <p className="processingCard__footnote">
              Can&apos;t find it in your inbox? Check your Spam or Junk folder —
              it may have landed there.
            </p>
          </div>
        </div>
      ) : (
        <LoadingScreen message="Redirecting you to your dashboard in a moment ..." />
      )}
    </section>
  );
}
