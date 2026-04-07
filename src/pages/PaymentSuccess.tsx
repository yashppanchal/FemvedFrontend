import { Link, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.scss";

type PaymentMetaField = {
  label: string;
  value: string;
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const paymentMeta: PaymentMetaField[] = [
    {
      label: "Order ID",
      value: searchParams.get("orderId") ?? "",
    },
    {
      label: "Transaction ID",
      value:
        searchParams.get("transactionId") ??
        searchParams.get("txnId") ??
        searchParams.get("paymentId") ??
        "",
    },
    {
      label: "Amount",
      value: searchParams.get("amount") ?? "",
    },
  ].filter((item) => item.value.trim().length > 0);

  return (
    <section className="page page--paymentSuccess">
      <div className="paymentSuccessCard">
        <div className="paymentSuccessCard__icon" aria-hidden="true" />
        <h1 className="page__title">Payment successful</h1>
        <p className="page__lead">
          Thank you! Your payment has been received and your order is confirmed.
        </p>

        {paymentMeta.length > 0 && (
          <dl className="paymentMeta">
            {paymentMeta.map((item) => (
              <div className="paymentMeta__row" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="paymentSuccessCard__actions">
          <Link to="/orders" className="button paymentSuccessCard__button">
            View order history
          </Link>
          <Link to="/dashboard?tab=library" className="paymentSuccessCard__link">
            Go to My Library
          </Link>
          <Link to="/dashboard" className="paymentSuccessCard__link">
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
