import "./ExpertDashboard.scss";
import { useEffect, useState } from "react";
import {
  getExpertEnrollments,
  startEnrollment,
  pauseExpertEnrollment,
  resumeEnrollment,
  endExpertEnrollment,
  type ExpertEnrollment,
} from "../api/experts";
import { ApiError } from "../api/client";

const today = () => new Date().toISOString().split("T")[0];

export default function ExpertClients() {
  const [enrollments, setEnrollments] = useState<ExpertEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Start date picker modal
  const [startPickerId, setStartPickerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(today());
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    getExpertEnrollments()
      .then(setEnrollments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load clients.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (id: string, accessStatus: string, extra?: Partial<ExpertEnrollment>) =>
    setEnrollments((prev) =>
      prev.map((e) => (e.accessId === id ? { ...e, accessStatus, ...extra } : e))
    );

  const runAction = async (accessId: string, action: () => Promise<void>, newStatus: string) => {
    setActionError(null);
    try {
      await action();
      updateStatus(accessId, newStatus);
      getExpertEnrollments().then(setEnrollments).catch(() => {});
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  const handleStartConfirm = async () => {
    if (!startPickerId) return;
    setStartingId(startPickerId);
    setActionError(null);
    try {
      await startEnrollment(startPickerId, startDate !== today() ? startDate : undefined);
      if (startDate === today()) {
        updateStatus(startPickerId, "Active", { startedAt: new Date().toISOString() });
      } else {
        updateStatus(startPickerId, "NotStarted", { scheduledStartAt: startDate });
      }
      getExpertEnrollments().then(setEnrollments).catch(() => {});
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setStartingId(null);
      setStartPickerId(null);
      setStartDate(today());
    }
  };

  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">My Clients</h1>
      <p className="page__lead">Users currently enrolled in your programs.</p>

      <div className="expertContent">
        <section className="expertSection">
          {loading && <p className="expertSection__loading">Loading clients…</p>}
          {error && <p className="form__error">{error}</p>}
          {actionError && <p className="form__error">{actionError}</p>}

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
                    <th>Actions</th>
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
                        {e.scheduledStartAt && e.accessStatus === "NotStarted" && (
                          <div className="expertTable__sub">
                            Scheduled: {new Date(e.scheduledStartAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                      <td className="expertTable__actions">
                        {e.accessStatus === "NotStarted" && (
                          <button
                            type="button"
                            className="expertTable__btn"
                            onClick={() => { setStartPickerId(e.accessId); setStartDate(today()); }}
                          >
                            {e.scheduledStartAt ? "Reschedule" : "Start"}
                          </button>
                        )}
                        {e.accessStatus === "Active" && (
                          <button
                            type="button"
                            className="expertTable__btn"
                            onClick={() => runAction(e.accessId, () => pauseExpertEnrollment(e.accessId), "Paused")}
                          >
                            Pause
                          </button>
                        )}
                        {e.accessStatus === "Paused" && (
                          <button
                            type="button"
                            className="expertTable__btn"
                            onClick={() => runAction(e.accessId, () => resumeEnrollment(e.accessId), "Active")}
                          >
                            Resume
                          </button>
                        )}
                        {(e.accessStatus === "Active" || e.accessStatus === "Paused") && (
                          <button
                            type="button"
                            className="expertTable__btn expertTable__btn--danger"
                            onClick={() => runAction(e.accessId, () => endExpertEnrollment(e.accessId), "Completed")}
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
        </section>
      </div>

      {/* Start date picker modal */}
      {startPickerId && (
        <div className="expertModal__backdrop" onClick={() => setStartPickerId(null)}>
          <div className="expertModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="expertModal__header">
              <h3 className="expertModal__title">Start Program</h3>
              <button type="button" className="expertModal__close" onClick={() => setStartPickerId(null)}>✕</button>
            </div>
            <div className="expertModal__body">
              <label className="field">
                <span className="field__label">Start date</span>
                <input
                  className="field__input"
                  type="date"
                  value={startDate}
                  min={today()}
                  onChange={(ev) => setStartDate(ev.target.value)}
                  disabled={!!startingId}
                />
              </label>
              {startDate === today() ? (
                <p className="expertModal__hint">Program will start immediately today.</p>
              ) : (
                <p className="expertModal__hint">
                  Program will be scheduled for {new Date(startDate + "T00:00:00").toLocaleDateString()}.
                  An email will be sent now confirming the schedule, and again 24 hours before the start date.
                </p>
              )}
            </div>
            <div className="expertModal__footer">
              <button type="button" className="expertTable__btn" onClick={() => setStartPickerId(null)} disabled={!!startingId}>
                Cancel
              </button>
              <button type="button" className="button" onClick={handleStartConfirm} disabled={!!startingId}>
                {startingId ? "Confirming…" : startDate === today() ? "Start now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
