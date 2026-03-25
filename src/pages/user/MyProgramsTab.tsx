import { useEffect, useState } from "react";
import { getMyProgramAccess, pauseMyEnrollment, resumeMyEnrollment, endMyEnrollment, requestStartDate, type MyProgramAccess } from "../../api/users";
import { ApiError } from "../../api/client";

const PAGE_SIZE = 15;
const today = () => new Date().toISOString().split("T")[0];

export default function MyProgramsTab() {
  const [programs, setPrograms] = useState<MyProgramAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Request start date modal
  const [requestStartId, setRequestStartId] = useState<string | null>(null);
  const [requestDate, setRequestDate] = useState(today());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    getMyProgramAccess()
      .then(setPrograms)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load programs.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reload = () =>
    getMyProgramAccess()
      .then(setPrograms)
      .catch((err) => {
        setActionError(err instanceof ApiError ? err.message : "Failed to refresh programs.");
      });

  const handlePause = async (accessId: string) => {
    setActionError(null);
    setPausingId(accessId);
    try {
      await pauseMyEnrollment(accessId);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setPausingId(null);
    }
  };

  const handleResume = async (accessId: string) => {
    setActionError(null);
    setResumingId(accessId);
    try {
      await resumeMyEnrollment(accessId);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setResumingId(null);
    }
  };

  const handleEnd = async (accessId: string) => {
    if (!confirm("Are you sure you want to end this enrollment?")) return;
    setActionError(null);
    setEndingId(accessId);
    try {
      await endMyEnrollment(accessId);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setEndingId(null);
    }
  };

  const handleRequestStart = async () => {
    if (!requestStartId) return;
    setRequesting(true);
    setActionError(null);
    try {
      await requestStartDate(requestStartId, requestDate);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to request start date.");
    } finally {
      setRequesting(false);
      setRequestStartId(null);
      setRequestDate(today());
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : "—";

  const projectedEndDate = (p: MyProgramAccess): string => {
    if (p.endDate) return formatDate(p.endDate);
    if (p.scheduledStartAt && p.durationWeeks) {
      const end = new Date(p.scheduledStartAt);
      end.setDate(end.getDate() + p.durationWeeks * 7);
      return end.toLocaleDateString();
    }
    return "—";
  };

  const statusLabel = (p: MyProgramAccess): string => {
    if (p.status === "NotStarted" && p.scheduledStartAt) return "Scheduled";
    return p.status;
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
        <>
          {Math.ceil(programs.length / PAGE_SIZE) > 1 && (
            <div className="dashPanel__pagination" style={{ marginBottom: 12 }}>
              <button type="button" className="dashTable__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {Math.ceil(programs.length / PAGE_SIZE)}</span>
              <button type="button" className="dashTable__btn" disabled={page >= Math.ceil(programs.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
          <div className="dashTableWrap">
          <table className="dashTable">
            <thead>
              <tr>
                <th>Program</th>
                <th>Expert</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => (
                p ? (
                  <tr key={p.accessId}>
                    <td>{p.programName}</td>
                    <td>{p.expertName}</td>
                    <td>{p.durationLabel}</td>
                    <td>
                      <span className={`statusBadge statusBadge--${statusLabel(p).toLowerCase()}`}>
                        {statusLabel(p)}
                      </span>
                      {p.startRequestStatus === "Pending" && (
                        <div className="dashTable__sub">Start request pending</div>
                      )}
                      {p.startRequestStatus === "Declined" && (
                        <div className="dashTable__sub dashTable__sub--warn">Start request declined</div>
                      )}
                    </td>
                    <td>
                      {p.startedAt
                        ? formatDate(p.startedAt)
                        : p.scheduledStartAt
                          ? `Scheduled: ${formatDate(p.scheduledStartAt)}`
                          : "—"}
                      {p.status === "Paused" && p.pausedAt && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                          Paused since {formatDate(p.pausedAt)}
                        </div>
                      )}
                    </td>
                    <td>{projectedEndDate(p)}</td>
                    <td className="dashTable__actions">
                      {p.status === "NotStarted" && !p.scheduledStartAt && p.startRequestStatus !== "Pending" && (
                        <button
                          type="button"
                          className="dashTable__btn"
                          onClick={() => { setRequestStartId(p.accessId); setRequestDate(today()); }}
                        >
                          Request Start Date
                        </button>
                      )}
                      {p.status === "Active" && (
                        <button
                          type="button"
                          className="dashTable__btn"
                          onClick={() => handlePause(p.accessId)}
                          disabled={pausingId === p.accessId}
                        >
                          {pausingId === p.accessId ? "Pausing…" : "Pause"}
                        </button>
                      )}
                      {p.status === "Paused" && (
                        <button
                          type="button"
                          className="dashTable__btn"
                          onClick={() => handleResume(p.accessId)}
                          disabled={resumingId === p.accessId}
                        >
                          {resumingId === p.accessId ? "Resuming…" : "Resume"}
                        </button>
                      )}
                      {(p.status === "Active" || p.status === "Paused") && (
                        <button
                          type="button"
                          className="dashTable__btn dashTable__btn--danger"
                          onClick={() => handleEnd(p.accessId)}
                          disabled={endingId === p.accessId}
                        >
                          {endingId === p.accessId ? "Ending…" : "End"}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : null
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {/* Request start date modal */}
      {requestStartId && (
        <div className="dashModal__backdrop" onClick={() => setRequestStartId(null)}>
          <div className="dashModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="dashModal__header">
              <h3 className="dashModal__title">Request Start Date</h3>
              <button type="button" className="dashModal__close" onClick={() => setRequestStartId(null)}>✕</button>
            </div>
            <div className="dashModal__body">
              <label className="field">
                <span className="field__label">Preferred start date</span>
                <input
                  className="field__input"
                  type="date"
                  value={requestDate}
                  min={today()}
                  onChange={(ev) => setRequestDate(ev.target.value)}
                  disabled={requesting}
                />
              </label>
              <p className="dashModal__hint">
                Your expert will review and confirm or suggest an alternative date.
              </p>
            </div>
            <div className="dashModal__footer">
              <button type="button" className="dashTable__btn" onClick={() => setRequestStartId(null)} disabled={requesting}>
                Cancel
              </button>
              <button type="button" className="button" onClick={handleRequestStart} disabled={requesting}>
                {requesting ? "Requesting…" : "Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
