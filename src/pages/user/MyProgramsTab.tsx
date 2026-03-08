import { useEffect, useState } from "react";
import { getMyProgramAccess, pauseMyEnrollment, endMyEnrollment, type MyProgramAccess } from "../../api/users";
import { ApiError } from "../../api/client";

export default function MyProgramsTab() {
  const [programs, setPrograms] = useState<MyProgramAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    getMyProgramAccess()
      .then(setPrograms)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load programs.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePause = async (accessId: string) => {
    setActionError(null);
    try {
      await pauseMyEnrollment(accessId);
      setPrograms((prev) =>
        prev.map((p) => p.accessId === accessId ? { ...p, accessStatus: "Paused" } : p)
      );
      getMyProgramAccess().then(setPrograms).catch(() => {});
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  const handleEnd = async (accessId: string) => {
    if (!confirm("Are you sure you want to end this enrollment?")) return;
    setActionError(null);
    try {
      await endMyEnrollment(accessId);
      setPrograms((prev) =>
        prev.map((p) => p.accessId === accessId ? { ...p, accessStatus: "Ended" } : p)
      );
      getMyProgramAccess().then(setPrograms).catch(() => {});
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  if (loading) return <p className="dashCard__loading">Loading programs…</p>;
  if (error) return <p className="dashCard__error">{error}</p>;

  return (
    <div className="dashCard dashCard--wide">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">My Programs</h2>
      </div>
      {actionError && <p className="dashCard__error">{actionError}</p>}
      {programs.length === 0 ? (
        <p className="dashCard__empty">You have not enrolled in any programs yet.</p>
      ) : (
        <div className="dashTableWrap">
          <table className="dashTable">
            <thead>
              <tr>
                <th>Program</th>
                <th>Expert</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.accessId}>
                  <td>{p.programName}</td>
                  <td>{p.expertName}</td>
                  <td>{p.durationLabel}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${p.accessStatus.toLowerCase()}`}>
                      {p.accessStatus}
                    </span>
                  </td>
                  <td className="dashTable__actions">
                    {p.accessStatus === "Active" && (
                      <button
                        type="button"
                        className="dashTable__btn"
                        onClick={() => handlePause(p.accessId)}
                      >
                        Pause
                      </button>
                    )}
                    {(p.accessStatus === "Active" || p.accessStatus === "Paused") && (
                      <button
                        type="button"
                        className="dashTable__btn dashTable__btn--danger"
                        onClick={() => handleEnd(p.accessId)}
                      >
                        End
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
