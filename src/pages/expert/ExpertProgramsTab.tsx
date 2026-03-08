import { useEffect, useState } from "react";
import { getExpertPrograms, type ExpertProgram } from "../../api/experts";
import { ApiError } from "../../api/client";

export default function ExpertProgramsTab() {
  const [programs, setPrograms] = useState<ExpertProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExpertPrograms()
      .then(setPrograms)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load programs.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="expertSection__loading">Loading programs…</p>;
  if (error) return <p className="form__error">{error}</p>;

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <h2 className="expertSection__title">My Programs</h2>
      </div>
      {programs.length === 0 ? (
        <p className="expertSection__empty">No programs found. Use the Create Program tab to add one.</p>
      ) : (
        <div className="expertTableWrap">
          <table className="expertTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Enrolled</th>
                <th>Active</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.programId}>
                  <td>{p.programName}</td>
                  <td>{p.totalEnrollments}</td>
                  <td>{p.activeEnrollments}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(p.status || "").toLowerCase() === "active" ? "active" : "ended"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
