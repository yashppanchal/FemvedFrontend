import "./ExpertDashboard.scss";
import { useEffect, useState } from "react";
import { getExpertEnrollments, type ExpertEnrollment } from "../api/experts";
import { ApiError } from "../api/client";

export default function ExpertClients() {
  const [enrollments, setEnrollments] = useState<ExpertEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExpertEnrollments()
      .then(setEnrollments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load clients.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">My Clients</h1>
      <p className="page__lead">Users currently enrolled in your programs.</p>

      <div className="expertContent">
        <section className="expertSection">
          {loading && <p className="expertSection__loading">Loading clients…</p>}
          {error && <p className="form__error">{error}</p>}

          {!loading && !error && enrollments.length === 0 && (
            <p className="expertSection__empty">No enrolled clients yet.</p>
          )}

          {!loading && !error && enrollments.length > 0 && (
            <div className="expertTableWrap">
              <table className="expertTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.accessId}>
                      <td>{e.userFirstName} {e.userLastName}</td>
                      <td>{e.userEmail}</td>
                      <td>{e.programName}</td>
                      <td>{e.durationLabel}</td>
                      <td>
                        <span className={`statusBadge statusBadge--${(e.accessStatus || "").toLowerCase()}`}>
                          {e.accessStatus}
                        </span>
                      </td>
                      <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
