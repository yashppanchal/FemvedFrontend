import "./OrderHistory.scss";

export default function OrderHistory() {
  return (
    <section className="page page--orderHistory">
      <div className="orderHistory__empty">
        <h1 className="page__title">Order History</h1>
        <p className="page__lead">No purchases or orders yet.</p>
      </div>
    </section>
  );
}
