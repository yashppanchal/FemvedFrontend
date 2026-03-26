import { useEffect, useState } from "react";
import { useEscapeKey } from "../../useEscapeKey";
import {
  getExpertEnrollments,
  startEnrollment,
  pauseExpertEnrollment,
  resumeEnrollment,
  endExpertEnrollment,
  approveStartDate,
  declineStartDate,
  getEnrollmentComments,
  postEnrollmentComment,
  type ExpertEnrollment,
  type EnrollmentComment,
} from "../../api/experts";
import { ApiError } from "../../api/client";
import { getStatusBadgeClass, formatStatus } from "../../statusBadge";

interface Props {
  filterProgramId?: string | null;
  filterProgramName?: string | null;
  onClearFilter?: () => void;
}

const STATUS_OPTIONS = ["All", "NotStarted", "Scheduled", "Active", "Paused", "Completed", "Cancelled"];
import { PAGE_SIZE } from "../../constants";

const today = () => new Date().toISOString().split("T")[0];

export default function ExpertEnrollmentsTab({ filterProgramId, filterProgramName, onClearFilter }: Props) {
  const [enrollments, setEnrollments] = useState<ExpertEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Comments modal
  const [commentsEnrollmentId, setCommentsEnrollmentId] = useState<string | null>(null);
  const [comments, setComments] = useState<EnrollmentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Action in-progress guard
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Start date picker modal
  const [startPickerId, setStartPickerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(today());
  const [startingId, setStartingId] = useState<string | null>(null);

  useEscapeKey(() => { if (commentsEnrollmentId) setCommentsEnrollmentId(null); else if (startPickerId) setStartPickerId(null); }, !!(startPickerId || commentsEnrollmentId));

  useEffect(() => {
    getExpertEnrollments()
      .then(setEnrollments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load enrollments.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (enrollmentId: string, status: string, extra?: Partial<ExpertEnrollment>) =>
    setEnrollments((prev) =>
      prev.map((e) => (e.accessId === enrollmentId ? { ...e, accessStatus: status, ...extra } : e))
    );

  const runAction = async (accessId: string, action: () => Promise<void>, newStatus: string) => {
    setActionError(null);
    setActioningId(accessId);
    try {
      await action();
      updateStatus(accessId, newStatus);
      getExpertEnrollments().then(setEnrollments).catch(() => {});
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setActioningId(null);
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

  const openComments = async (enrollmentId: string) => {
    setCommentsEnrollmentId(enrollmentId);
    setCommentsLoading(true);
    setComments([]);
    try {
      const data = await getEnrollmentComments(enrollmentId);
      setComments(data);
    } catch {
      // Show empty
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentsEnrollmentId || !commentText.trim()) return;
    setPostingComment(true);
    try {
      await postEnrollmentComment(commentsEnrollmentId, commentText.trim());
      const updated = await getEnrollmentComments(commentsEnrollmentId);
      setComments(updated);
      setCommentText("");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  // Build year list from enrolled dates
  const years = [...new Set(enrollments.map((e) => new Date(e.enrolledAt).getFullYear()))].sort((a, b) => b - a);

  // Reset page when any filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter, monthFilter, yearFilter, filterProgramId]);

  const filtered = enrollments.filter((e) => {
    if (filterProgramId && e.programId !== filterProgramId) return false;
    const fullName = `${e.userFirstName} ${e.userLastName}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase()) && !e.userEmail.toLowerCase().includes(search.toLowerCase()) && !e.programName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "Scheduled") {
      if (!(e.accessStatus === "NotStarted" && e.scheduledStartAt)) return false;
    } else if (statusFilter !== "All" && e.accessStatus !== statusFilter) return false;
    if (monthFilter) {
      const m = new Date(e.enrolledAt).getMonth() + 1;
      if (m !== parseInt(monthFilter)) return false;
    }
    if (yearFilter) {
      const y = new Date(e.enrolledAt).getFullYear();
      if (y !== parseInt(yearFilter)) return false;
    }
    return true;
  });

  if (loading) return <p className="expertSection__loading">Loading enrollments…</p>;
  if (error) return <p className="form__error">{error}</p>;

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <h2 className="expertSection__title">Enrollments</h2>
      </div>

      {filterProgramName && (
        <div className="expertSection__filterBanner">
          <span>Filtered by: <strong>{filterProgramName}</strong></span>
          <button type="button" className="expertTable__btn" onClick={onClearFilter}>Clear filter</button>
        </div>
      )}

      {/* Filters */}
      <div className="expertPanel__toolbar">
        <input
          className="field__input expertPanel__search"
          type="search"
          placeholder="Search by name, email or program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field__input expertPanel__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          className="field__input expertPanel__select"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">All months</option>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          className="field__input expertPanel__select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="expertPanel__count">{filtered.length} enrollments</span>
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="expertPanel__pagination">
            <button type="button" className="expertTable__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" className="expertTable__btn" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {actionError && <p className="form__error">{actionError}</p>}

      {filtered.length === 0 ? (
        <p className="expertSection__empty">No enrollments match your filters.</p>
      ) : (
        <div className="expertTableWrap">
          <table className="expertTable expertTable--wide">
            <thead>
              <tr>
                <th>Client</th>
                <th>Program</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Start / End Date</th>
                <th>Requested Start</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((e) => (
                <tr key={e.accessId}>
                  <td>
                    <div>{e.userFirstName + " " + e.userLastName}</div>
                    <div className="expertTable__sub">{e.userEmail}</div>
                  </td>
                  <td>{e.programName}</td>
                  <td>{e.durationLabel}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${getStatusBadgeClass(e.scheduledStartAt && e.accessStatus === "NotStarted" ? "Scheduled" : e.accessStatus)}`}>
                      {e.scheduledStartAt && e.accessStatus === "NotStarted" ? "Scheduled" : formatStatus(e.accessStatus)}
                    </span>
                  </td>
                  <td>
                    {e.startedAt ? (
                      <>
                        <div>Started: {new Date(e.startedAt).toLocaleDateString()}</div>
                        {e.endDate
                          ? <div className="expertTable__sub">Ends: {new Date(e.endDate).toLocaleDateString()}</div>
                          : e.durationWeeks > 0 && <div className="expertTable__sub">Ends: {new Date(new Date(e.startedAt).getTime() + e.durationWeeks * 7 * 86400000).toLocaleDateString()}</div>
                        }
                        {e.accessStatus === "Paused" && e.pausedAt && (
                          <div className="expertTable__sub">Paused since {new Date(e.pausedAt).toLocaleDateString()}</div>
                        )}
                      </>
                    ) : e.scheduledStartAt ? (
                      <>
                        <div>{new Date(e.scheduledStartAt).toLocaleDateString()}</div>
                        {e.durationWeeks > 0 && (
                          <div className="expertTable__sub">Projected end: {new Date(new Date(e.scheduledStartAt).getTime() + e.durationWeeks * 7 * 86400000).toLocaleDateString()}</div>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td>
                    {e.requestedStartDate ? (
                      <>
                        <div>{new Date(e.requestedStartDate).toLocaleDateString()}</div>
                        {e.startRequestStatus && (
                          <div className="expertTable__sub">{e.startRequestStatus}</div>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td className="expertTable__actionsCell">
                    <div className="expertTable__actions">
                      {e.accessStatus === "NotStarted" && (
                        <button
                          type="button"
                          className="expertTable__btn"
                          onClick={() => { setStartPickerId(e.accessId); setStartDate(e.scheduledStartAt ? e.scheduledStartAt.split("T")[0] : today()); }}
                          disabled={actioningId === e.accessId}
                        >
                          {e.scheduledStartAt ? "Reschedule" : "Start"}
                        </button>
                      )}
                      {e.startRequestStatus === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="expertTable__btn expertTable__btn--success"
                            onClick={() => runAction(e.accessId, () => approveStartDate(e.accessId), e.accessStatus)}
                            disabled={actioningId === e.accessId}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="expertTable__btn expertTable__btn--danger"
                            onClick={() => runAction(e.accessId, () => declineStartDate(e.accessId), e.accessStatus)}
                            disabled={actioningId === e.accessId}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {e.accessStatus === "Active" && (
                        <button
                          type="button"
                          className="expertTable__btn"
                          onClick={() => runAction(e.accessId, () => pauseExpertEnrollment(e.accessId), "Paused")}
                          disabled={actioningId === e.accessId}
                        >
                          Pause
                        </button>
                      )}
                      {e.accessStatus === "Paused" && (
                        <button
                          type="button"
                          className="expertTable__btn"
                          onClick={() => runAction(e.accessId, () => resumeEnrollment(e.accessId), "Active")}
                          disabled={actioningId === e.accessId}
                        >
                          Resume
                        </button>
                      )}
                      {(e.accessStatus === "Active" || e.accessStatus === "Paused") && (
                        <button
                          type="button"
                          className="expertTable__btn expertTable__btn--danger"
                          onClick={() => runAction(e.accessId, () => endExpertEnrollment(e.accessId), "Completed")}
                          disabled={actioningId === e.accessId}
                        >
                          End
                        </button>
                      )}
                      <button
                        type="button"
                        className="expertTable__btn"
                        onClick={() => openComments(e.accessId)}
                      >
                        Comments
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Start date picker modal */}
      {startPickerId && (
        <div className="expertModal__backdrop" onClick={() => setStartPickerId(null)}>
          <div className="expertModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="expertModal__header">
              <h3 className="expertModal__title">{enrollments.find(e => e.accessId === startPickerId)?.scheduledStartAt ? "Reschedule Program" : "Start Program"}</h3>
              <button type="button" className="expertModal__close" onClick={() => setStartPickerId(null)} aria-label="Close">✕</button>
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

      {/* Comments modal */}
      {commentsEnrollmentId && (
        <div className="expertModal__backdrop" onClick={() => setCommentsEnrollmentId(null)}>
          <div className="expertModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="expertModal__header">
              <h3 className="expertModal__title">Enrollment Comments</h3>
              <button
                type="button"
                className="expertModal__close"
                onClick={() => setCommentsEnrollmentId(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {commentsLoading ? (
              <p className="expertSection__loading">Loading…</p>
            ) : comments.length === 0 ? (
              <p className="expertSection__empty">No comments yet.</p>
            ) : (
              <ul className="expertComments">
                {comments.map((c) => (
                  <li key={c.commentId} className="expertComments__item">
                    <p className="expertComments__text">{c.updateNote}</p>
                    <span className="expertComments__date">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="expertModal__compose">
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={commentText}
                onChange={(ev) => setCommentText(ev.target.value)}
                placeholder="Write a comment…"
                disabled={postingComment}
              />
              <button
                type="button"
                className="button"
                onClick={handlePostComment}
                disabled={postingComment || !commentText.trim()}
              >
                {postingComment ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
