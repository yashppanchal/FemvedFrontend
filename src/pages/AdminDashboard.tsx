import "./AdminDashboard.scss";

export default function AdminDashboard() {
  return (
    <section className="page page--adminDashboard">
      <h1 className="page__title">Admin Dashboard</h1>
      <p className="page__lead">
        Manage users, experts, programs, and platform settings.
      </p>

      <div className="adminContent">
        <div className="adminPlaceholder">
          <p className="adminPlaceholder__text">
            Admin tools and management panels will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}
