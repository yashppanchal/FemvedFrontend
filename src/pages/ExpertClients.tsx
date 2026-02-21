import "./ExpertDashboard.scss";

const MOCK_CLIENTS = [
  { id: "U-101", name: "Ananya Rao", email: "ananya@example.com", status: "Active" },
  { id: "U-102", name: "Maya Sharma", email: "maya@example.com", status: "Pending" },
  { id: "U-103", name: "Sana Ali", email: "sana@example.com", status: "Active" },
];

const MOCK_PROGRAMS = [
  "Hormonal Health Support",
  "Mental and Spiritual Wellbeing",
  "Longevity and Healthy Ageing Guidance",
];

export default function ExpertClients() {
  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">Clients</h1>
      <p className="page__lead">View and manage your clients and programs.</p>

      <div className="expertContent">
        <section className="expertSection">
          <h2 className="expertSection__title">Client List</h2>

          <div className="expertTableWrap">
            <table className="expertTable">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CLIENTS.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="expertSection">
          <h2 className="expertSection__title">Programs You Teach</h2>
          <ul className="expertPrograms__list">
            {MOCK_PROGRAMS.map((program) => (
              <li key={program}>{program}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
