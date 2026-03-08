import { Link } from "react-router-dom";
import "./PaymentCancel.scss";

export default function PaymentCancel() {
  return (
    <section className="page page--paymentCancel">
      <div className="paymentCancelCard">
        <div className="paymentCancelCard__icon" aria-hidden="true" />
        <h1 className="page__title">Payment cancelled</h1>
        <p className="page__lead">
          Your payment was not completed. You can try enrolling again whenever you are
          ready.
        </p>
        <div className="paymentCancelCard__actions">
          <Link to="/all-guided-programs" className="button paymentCancelCard__button">
            Browse guided programs
          </Link>
          <Link to="/orders" className="paymentCancelCard__link">
            View order history
          </Link>
        </div>
      </div>
    </section>
  );
}
